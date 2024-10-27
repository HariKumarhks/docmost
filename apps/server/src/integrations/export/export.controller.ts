import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportAllSpaceDto, ExportPageDto } from './dto/export-dto';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { User } from '@docmost/db/types/entity.types';
import SpaceAbilityFactory from '../../core/casl/abilities/space-ability.factory';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PageRepo } from '@docmost/db/repos/page/page.repo';
import {
  SpaceCaslAction,
  SpaceCaslSubject,
} from '../../core/casl/interfaces/space-ability.type';
import { FastifyReply } from 'fastify';
import { sanitize } from 'sanitize-filename-ts';
import { getExportExtension } from './utils';
import { getMimeType } from '../../common/helpers';
import { serialize } from 'v8';

@Controller()
export class ImportController {
  private readonly logger = new Logger('TESTTTT');
  constructor(
    private readonly exportService: ExportService,
    private readonly pageRepo: PageRepo,
    private readonly spaceAbility: SpaceAbilityFactory,
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('pages/export')
  async exportPage(
    @Body() dto: ExportPageDto,
    @AuthUser() user: User,
    @Res() res: FastifyReply,
  ) {
    const page = await this.pageRepo.findById(dto.pageId, {
      includeContent: true,
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const ability = await this.spaceAbility.createForUser(user, page.spaceId);
    if (ability.cannot(SpaceCaslAction.Read, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    const rawContent = await this.exportService.exportPage(dto.format, page);

    const fileExt = getExportExtension(dto.format);
    const fileName = sanitize(page.title || 'Untitled') + fileExt;

    res.headers({
      'Content-Type': getMimeType(fileExt),
      'Content-Disposition':
        'attachment; filename="' + encodeURIComponent(fileName) + '"',
    });

    res.send(rawContent);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('pages/exportall')
  async exportAllPageOfASpace(
    @Body() dto: ExportAllSpaceDto,
    @AuthUser() user: User,
    @Res() res: FastifyReply,
  ) {
    const pages = await this.pageRepo.findBySpaceId(dto.spaceId, {
      includeContent: true,
    });

    if (!pages) {
      throw new NotFoundException('Pages not found');
    }

    const ability = await this.spaceAbility.createForUser(user, dto.spaceId);
    if (ability.cannot(SpaceCaslAction.Read, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    this.logger.log('Total Page Exporting :: ', pages.length);

    let pagesRes: { [key: string]: string[] } = {};
    // let pagesRes: string[][] = []

    for (const pg of pages) {
      // const rawContent = await this.exportService.exportPage(dto.format, pg);
      // js[pg.id]
      pagesRes[pg.id] = [
        pg.parentPageId,
        await this.exportService.exportPage(dto.format, pg),
      ];
    }

    res.headers({
      // 'Content-Type': getExportExtension(dto.format),
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; spaceId="${encodeURIComponent(dto.spaceId)}"`,
    });

    // res.send(serialize(pages));
    res.send(JSON.stringify(pagesRes));
    //     res.send(`line 1\n
    // line 2
    //     line 3
    //         line 5
    // line 4`);
  }
}
