export type Category = {
  id: string;
  name: string; 
};

export interface MicroCmsPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  categories: Category[];
  thumbnail: { url: string; height: number; width: number };
}

const [posts, setPosts] = useState<MicroCmsPost[]>([]);