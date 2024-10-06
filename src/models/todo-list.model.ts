export interface IUpdateList {
  listId: string;
  userId: string;
  listTitle: string;
  sharedUsrID: string[];
}

export interface IUndoListResponse {
  isDeleted: boolean;
  isHidden: boolean;
  isArchived: boolean;
}