// Content-related Types

export interface Content {
  id: string;
  user_id: string;
  title: string;
  subtitle?: string;
  topic: string;
  content_type: string;
  body_markdown?: string;
  meta_description?: string;
  keywords?: string[];
  llm_provider?: string;
  llm_model?: string;
  review_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ContentCalendar {
  id: string;
  user_id: string;
  google_sheet_id?: string;
  category: string;
  main_topic: string;
  subtopics?: Record<string, unknown>;
  publish_frequency?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
