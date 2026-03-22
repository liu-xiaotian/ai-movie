// types/movie.ts

export interface Movie {
  id: string; // 注意：例子中是 "top1"，所以是 string
  rank: number; // 排名
  title: string; // 电影标题
  description: string; // 简介
  image: string; // 标准封面图
  big_image: string; // 高清大图
  thumbnail: string; // 缩略图
  rating: string; // 评分（例子中是 "9.3"，建议设为 string）
  year: number; // 上映年份
  genre: string[]; // 类别（字符串数组）
  imdbid: string; // IMDB 唯一标识
  imdb_link: string; // IMDB 详情链接
}
