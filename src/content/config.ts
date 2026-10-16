import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    category: z.string().optional(),
    cover: z.string().optional(),
    notionId: z.string().optional(),
  }),
});

export const collections = { blog };
