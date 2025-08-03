interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

interface WithPagingResponse<T> {
  records: T[];
  page_meta: {
    total: number;
    page: number;
    size: number;
  };
}

interface ApiWithPagingResponse<T> {
  data: WithPagingResponse<T>;
  message: string;
  status: number;
}
