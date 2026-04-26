interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

interface WithPagingResponse<T> {
  records: T[];
  page_summary: {
    total: number;
    page: number;
    size: number;
    hasNext: boolean;
  };
}

interface ApiWithPagingResponse<T> {
  data: WithPagingResponse<T>;
  message: string;
  status: number;
}
