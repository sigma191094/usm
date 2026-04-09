import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity';
import { Match } from './src/matches/match.entity';
import { Player } from './src/matches/player.entity';
import { Vote } from './src/matches/vote.entity';
import { Standing } from './src/matches/standing.entity';
import { News } from './src/news/news.entity';
import { NewsComment } from './src/news/news-comment.entity';
import { Product } from './src/store/product.entity';
import { Order, OrderItem } from './src/store/order.entity';
import { Ad, AdEvent } from './src/ads/ad.entity';
import { Giveaway } from './src/giveaways/entities/giveaway.entity';
import { GiveawayEntry } from './src/giveaways/entities/giveaway-entry.entity';
import { QuizQuestion, Leaderboard } from './src/fun-zone/quiz.entity';
import { Donation } from './src/donations/entities/donation.entity';
import { Objective } from './src/donations/entities/objective.entity';
import { ForumPost, ForumComment } from './src/forum/forum.entity';
import { SupportMessage } from './src/support/support.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'usm_media',
    entities: [
        User, Match, Player, Vote, Standing, News, NewsComment,
        Product, Order, OrderItem, Ad, AdEvent, 
        Giveaway, GiveawayEntry, QuizQuestion, Leaderboard,
        Donation, Objective, ForumPost, ForumComment, SupportMessage
    ],
    synchronize: true,
    logging: true,
});

AppDataSource.initialize()
    .then(async () => {
        console.log('✅ Database synchronized successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error during database synchronization:', error);
        process.exit(1);
    });
