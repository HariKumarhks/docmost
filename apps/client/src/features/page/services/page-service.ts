import api from "@/lib/api-client";
import {
  ExportFormat,
  IExportPageParams,
  IMovePage,
  IPage,
  IPageInput,
  SidebarPagesParams,
} from "@/features/page/types/page.types";
import { IAttachment, IPagination } from "@/lib/types.ts";
import { saveAs } from "file-saver";

export async function createPage(data: Partial<IPage>): Promise<IPage> {
  const req = await api.post<IPage>("/pages/create", data);
  return req.data;
}

export async function getPageById(
  pageInput: Partial<IPageInput>,
): Promise<IPage> {
  const req = await api.post<IPage>("/pages/info", pageInput);
  return req.data;
}

export async function updatePage(data: Partial<IPageInput>): Promise<IPage> {
  const req = await api.post<IPage>("/pages/update", data);
  return req.data;
}

export async function deletePage(pageId: string): Promise<void> {
  await api.post("/pages/delete", { pageId });
}

export async function movePage(data: IMovePage): Promise<void> {
  await api.post<void>("/pages/move", data);
}

export async function getSidebarPages(
  params: SidebarPagesParams,
): Promise<IPagination<IPage>> {
  const req = await api.post("/pages/sidebar-pages", params);
  return req.data;
}

export async function getPageBreadcrumbs(
  pageId: string,
): Promise<Partial<IPage[]>> {
  const req = await api.post("/pages/breadcrumbs", { pageId });
  return req.data;
}

export async function getRecentChanges(
  spaceId?: string,
): Promise<IPagination<IPage>> {
  const req = await api.post("/pages/recent", { spaceId });
  return req.data;
}

export async function exportPage(data: IExportPageParams): Promise<void> {
  const req = await api.post("/pages/export", data, {
    responseType: "blob",
  });

  const fileName = req?.headers["content-disposition"]
    .split("filename=")[1]
    .replace(/"/g, "");


  console.log("CCC :: ", await req.data.text());
  

  saveAs(req.data, decodeURIComponent(fileName));
}

export async function exportAllPageOfASpace(spaceId: string, format: ExportFormat): Promise<void> {
  const req = await api.post("/pages/exportall", { spaceId, format }, {
    responseType: "blob",
  });
  console.log("ERER ::: ", req.data);
  var txtt = await req.data.text()
  var ppp = JSON.parse(txtt)
  console.log("ERER ::: ", Object.keys(ppp));
  console.log("ERER ::: ", ppp["0192c9e0-bb82-735c-a073-ab7dfef3d74b"][1]);

  saveAs(req.data, decodeURIComponent("fileName"));

  return


  const dataa = await req.data.text()
  const dataa1 = JSON.parse(dataa)

  console.log("ERER ::: ", dataa1);

  const dd = JSON.stringify(dataa1[0])
  console.log("dd ::: ", dd);

//   saveAs(new Blob([JSON.stringify(dataa1[0])], {
//     type: 'text/plain'
// }), `${spaceId}123.txt`);
  saveAs(req.data, `${spaceId}123.txt`);
}

export async function importPage(file: File, spaceId: string) {
  const formData = new FormData();
  formData.append("spaceId", spaceId);
  formData.append("file", file);

  const req = await api.post<IPage>("/pages/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return req.data;
}

export async function uploadFile(
  file: File,
  pageId: string,
  attachmentId?: string,
): Promise<IAttachment> {
  const formData = new FormData();
  if (attachmentId) {
    formData.append("attachmentId", attachmentId);
  }
  formData.append("pageId", pageId);
  formData.append("file", file);

  const req = await api.post<IAttachment>("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return req as unknown as IAttachment;
}
