import { getAllRSSFeedsInOne } from "@/services/rss.service";


export async function updateArticlesJob() {
    const articles = await getAllRSSFeedsInOne();

    for (const article of articles) {
        console.log(`[INFO] Article: ${article.title}`);
    }
}