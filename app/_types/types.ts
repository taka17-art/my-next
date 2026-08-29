export type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  thumbnailUrl: string;
  categories: string[];
};
export type ContactForm = {
  name: string;
  email: string;
  message: string;
};