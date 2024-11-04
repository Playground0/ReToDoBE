
export interface INewTask {
  currentListId: string;
  previousListID: string;
  userId: string;
  taskTitle: string;
  creationDate: string;
  updationDate: string;
  taskStartDate: string;
  taskEndDate: string;
  taskDesc: string;
  occurance: string;
  priority: number;
  reminder: boolean;
  isRecurring: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  isCompleted: boolean;
  isDeletedWithList: boolean;
  isArchivedWithList: boolean;
  isHiddenWithList: boolean;
}

export interface ICreateTaskRequest {
  currentListId: string;
  previousListID: string;
  taskTitle: string;
  taskStartDate: string;
  taskEndDate: string;
  taskDesc: string;
  occurance: string;
  priority: number;
  reminder: boolean;
  isRecurring: boolean;
}

export interface IUpdateTaskRequest extends ICreateTaskRequest {
  taskId: string;
}

export interface IUndoTaskResponse {
  isDeleted: boolean | null | undefined;
  isCompleted: boolean | null | undefined;
  isArchived: boolean | null | undefined;
}