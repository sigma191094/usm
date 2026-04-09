import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'database.sqlite',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Connected to database');

  // Users
  const userRepo = AppDataSource.getRepository('users');
  const hash = await bcrypt.hash('password123', 10);

  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@usm.tn' } });
  if (!existingAdmin) {
    const users = await userRepo.save([
        { email: 'admin@usm.tn', password: hash, name: 'Admin USM', role: 'admin', pointsBalance: 9999 },
        { email: 'fan@usm.tn', password: hash, name: 'Mohamed Fan', role: 'fan', pointsBalance: 350 },
        { email: 'premium@usm.tn', password: hash, name: 'Aymen Premium', role: 'premium', pointsBalance: 1200 },
        { email: 'sponsor@usm.tn', password: hash, name: 'Sponsor Corp', role: 'sponsor', pointsBalance: 0 },
    ]);
    console.log(`✅ Seeded ${users.length} users`);
  } else {
    console.log('ℹ️ Users already seeded');
  }

  // Matches
  const matchRepo = AppDataSource.getRepository('matches');
  await matchRepo.save([
    { homeTeam: 'USM', awayTeam: 'Espérance ST', date: new Date('2025-05-15T20:00:00Z'), status: 'live', homeScore: 2, awayScore: 1, competition: 'Ligue 1', venue: 'Stade Municipale', streamUrl: 'https://stream.example.com/usm-live', isPremium: true, sport: 'football' },
    { homeTeam: 'USM', awayTeam: 'Club Africain', date: new Date('2025-05-22T18:00:00Z'), status: 'upcoming', competition: 'Coupe de Tunisie', venue: 'Stade Monastir', isPremium: false, sport: 'football' },
    { homeTeam: 'Sfaxien', awayTeam: 'USM', date: new Date('2025-05-08T19:00:00Z'), status: 'ended', homeScore: 1, awayScore: 3, competition: 'Ligue 1', venue: 'Stade Sfax', replayUrl: 'https://replay.example.com/sfax-usm', isPremium: false, sport: 'football' },
    { homeTeam: 'USM', awayTeam: 'Étoile du Sahel', date: new Date('2025-06-01T20:00:00Z'), status: 'upcoming', competition: 'Ligue 1', venue: 'Stade Municipale', isPremium: true, sport: 'football' },
    // Basketball
    { homeTeam: 'USM Basket', awayTeam: 'ES Radès', date: new Date('2025-05-16T18:30:00Z'), status: 'upcoming', competition: 'Pro A', venue: 'Salle Mazali', isPremium: true, sport: 'basketball' },
    { homeTeam: 'JS Kairouan', awayTeam: 'USM Basket', date: new Date('2025-05-10T17:00:00Z'), status: 'ended', homeScore: 78, awayScore: 82, competition: 'Pro A', venue: 'Salle Kairouan', isPremium: false, sport: 'basketball' },
  ]);
  console.log('✅ Seeded matches');

  // Standings
  const standingRepo = AppDataSource.getRepository('standings');
  await standingRepo.save([
    // Football Ligue 1
    { teamName: 'US Monastir', played: 12, won: 8, drawn: 3, lost: 1, points: 27, sport: 'football', rank: 1 },
    { teamName: 'Espérance ST', played: 12, won: 7, drawn: 4, lost: 1, points: 25, sport: 'football', rank: 2 },
    { teamName: 'Club Africain', played: 12, won: 6, drawn: 2, lost: 4, points: 20, sport: 'football', rank: 3 },
    { teamName: 'Étoile du Sahel', played: 12, won: 5, drawn: 3, lost: 4, points: 18, sport: 'football', rank: 4 },
    // Basketball Pro A
    { teamName: 'US Monastir', played: 8, won: 8, drawn: 0, lost: 0, points: 16, sport: 'basketball', rank: 1 },
    { teamName: 'Club Africain', played: 8, won: 6, drawn: 0, lost: 2, points: 14, sport: 'basketball', rank: 2 },
    { teamName: 'ES Radès', played: 8, won: 5, drawn: 0, lost: 3, points: 13, sport: 'basketball', rank: 3 },
  ]);
  console.log('✅ Seeded standings');

  // News
  const newsRepo = AppDataSource.getRepository('news');
  await newsRepo.save([
    { title: 'USM Remporte le Derby du Sahel !', body: 'Une victoire éclatante 3-1 contre Sfaxien en déplacement. Les supporters étaient en délire après ce match historique qui propulse USM en tête du classement.', category: 'article', authorName: 'Rédaction USM', imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800' },
    { title: 'Transfert : Youssef Msakni rejoint l\'USM', body: 'Le club annonce officiellement l\'arrivée de la star tunisienne pour la saison prochaine. Un recrutement majeur qui renforce considérablement l\'effectif.', category: 'transfer', authorName: 'Presse USM', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800' },
    { title: 'Interview : Le coach parle de la saison', body: 'Notre entraineur revient sur les performances de l\'équipe et dévoile la stratégie pour les matches à venir. Une interview exclusive pleine de révélations.', category: 'interview', authorName: 'TV USM', imageUrl: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800' },
    { title: 'Journée Portes Ouvertes au Centre d\'Entraînement', body: 'Le club organise une journée exceptionnelle pour les jeunes supporters. Rencontrez vos idoles et visitez les installations du club.', category: 'announcement', authorName: 'Bureau USM', imageUrl: 'https://images.unsplash.com/photo-1599472234237-9c1ba2e64c44?w=800' },
    { title: 'USM : Bilan à mi-saison', body: 'Retour sur les 17 premiers matchs de la saison avec statistiques, meilleurs buteurs et perspectives pour la deuxième phase.', category: 'article', authorName: 'Rédaction USM', imageUrl: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800' },
  ]);
  console.log('✅ Seeded news');

  // Gallery
  const galleryRepo = AppDataSource.getRepository('gallery');
  await galleryRepo.save([
    { title: 'Derby du Sahel 2025', imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800', category: 'match', description: 'Ambiance électrique lors du derby' },
    { title: 'Supporters en Fête', imageUrl: 'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?w=800', category: 'fan', description: 'Nos fans, notre fierté' },
    { title: 'Séance d\'Entraînement', imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800', category: 'training', description: 'Préparation intense avant le match' },
    { title: 'Cérémonie de Remise des Prix', imageUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800', category: 'event', description: 'Remise du trophée de champion' },
    { title: 'Match vs Club Africain', imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800', category: 'match', description: 'Victoire 2-0 à domicile' },
    { title: 'Tifo des Ultras Monastir', imageUrl: 'https://images.unsplash.com/photo-1516905041604-7b7a1bce9e1d?w=800', category: 'fan', description: 'Un tifo remarquable de nos ultras' },
  ]);
  console.log('✅ Seeded gallery');

  // Products
  const productRepo = AppDataSource.getRepository('products');
  await productRepo.save([
    { name: 'Maillot Domicile 2025', description: 'Maillot officiel USM domicile, tissu respirant haute qualité', price: 89.99, category: 'jersey', imageUrl: 'https://images.unsplash.com/photo-1562751361-f44bd5f9caa6?w=800', stock: 50 },
    { name: 'Maillot Extérieur 2025', description: 'Maillot officiel USM extérieur, edition limitée', price: 89.99, category: 'jersey', imageUrl: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800', stock: 35 },
    { name: 'Écharpe USM Premium', description: 'Écharpe officielle USM, laine mérinos, édition collector', price: 29.99, category: 'scarf', imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800', stock: 100 },
    { name: 'Casquette USM', description: 'Casquette officielle brodée du logo USM', price: 24.99, category: 'hat', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800', stock: 80 },
    { name: 'Pack Supporter Premium', description: 'Maillot + écharpe + casquette + porte-clés offert', price: 129.99, category: 'accessory', imageUrl: 'https://images.unsplash.com/photo-1571945192955-e498b9f1a7e4?w=800', stock: 20 },
  ]);
  console.log('✅ Seeded products');

  // Quiz Questions
  const quizRepo = AppDataSource.getRepository('quiz_questions');
  await quizRepo.save([
    { question: 'En quelle année l\'USM a-t-il été fondé ?', options: ['1923', '1928', '1932', '1940'], correctIndex: 1, pointsReward: 50, category: 'history' },
    { question: 'Quel est le surnom de l\'USM ?', options: ['Les Lions', 'Les Étoiles', 'Les Bleus de Monastir', 'Les Moines'], correctIndex: 2, pointsReward: 30, category: 'general' },
    { question: 'Combien de fois l\'USM a-t-il remporté la Coupe de Tunisie ?', options: ['1', '2', '3', '4'], correctIndex: 1, pointsReward: 50, category: 'trophies' },
    { question: 'Qui est le meilleur buteur historique de l\'USM ?', options: ['Hamdi Nagguez', 'Walid Azaiez', 'Chamseddine Dkhili', 'Riadh Jelassi'], correctIndex: 2, pointsReward: 100, category: 'players' },
    { question: 'Dans quelle ville se trouve le stade de l\'USM ?', options: ['Tunis', 'Sfax', 'Monastir', 'Sousse'], correctIndex: 2, pointsReward: 20, category: 'general' },
  ]);
  console.log('✅ Seeded quiz questions');

  // Ads
  const adRepo = AppDataSource.getRepository('ads');
  await adRepo.save([
    { title: 'Puma — Équipementier Officiel', type: 'banner', mediaUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200', targetUrl: 'https://puma.com', sponsorName: 'Puma', active: true },
    { title: 'Tunisie Telecom — Sponsor Principal', type: 'banner', mediaUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200', targetUrl: 'https://tt.com.tn', sponsorName: 'Tunisie Telecom', active: true },
    { title: 'Abonnez-vous à USM Premium', type: 'sponsored', mediaUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200', targetUrl: '/premium', sponsorName: 'USM Media', active: true },
  ]);
  console.log('✅ Seeded ads');

  // Leaderboard
  const lbRepo = AppDataSource.getRepository('leaderboard');
  await lbRepo.save([
    { userId: 2, userName: 'Mohamed Fan', totalPoints: 350, weeklyPoints: 120, rank: 1 },
    { userId: 3, userName: 'Aymen Premium', totalPoints: 1200, weeklyPoints: 450, rank: 2 },
  ]);
  console.log('✅ Seeded leaderboard');

  // Players
  const playerRepo = AppDataSource.getRepository('players');
  await playerRepo.save([
    // Football - US Monastir
    { 
      name: 'Béchir Ben Saïd', number: 16, position: 'Gardien', sport: 'football', 
      nationality: 'Tunisien', age: 30, height: '1m92', weight: '85kg',
      imageUrl: 'https://images.unsplash.com/photo-1599472234237-9c1ba2e64c44?w=500',
      bio: 'Gardien international tunisien, pilier de l\'équipe nationale et de l\'USM.'
    },
    { 
      name: 'Youssef Msakni', number: 7, position: 'Attaquant', sport: 'football', 
      nationality: 'Tunisien', age: 34, height: '1m79', weight: '73kg',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500',
      bio: 'La star de la sélection nationale, connu pour son génie technique et ses buts décisifs.'
    },
    { 
      name: 'Hamza Mathlouthi', number: 2, position: 'Défenseur', sport: 'football', 
      nationality: 'Tunisien', age: 32, height: '1m81', weight: '78kg',
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500',
      bio: 'Défenseur latéral expérimenté, solide dans les duels et apport offensif constant.'
    },
    { 
      name: 'Aymen Dahmen', number: 1, position: 'Gardien', sport: 'football', 
      nationality: 'Tunisien', age: 27, height: '1m88', weight: '82kg',
      imageUrl: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=500',
      bio: 'Excellent sur sa ligne et expert dans l\'arrêt des penalties.'
    },
    { 
      name: 'Mohamed Ali Ben Romdhane', number: 8, position: 'Milieu', sport: 'football', 
      nationality: 'Tunisien', age: 25, height: '1m85', weight: '76kg',
      imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500',
      bio: 'Milieu box-to-box moderne avec une excellente vision de jeu.'
    },
    
    // Basketball - US Monastir
    { 
      name: 'Radhouane Slimane', number: 12, position: 'Ailier Fort', sport: 'basketball', 
      nationality: 'Tunisien', age: 44, height: '2m05', weight: '105kg',
      imageUrl: 'https://images.unsplash.com/photo-1562751361-f44bd5f9caa6?w=500',
      bio: 'Légende vivante du basket tunisien, meneur d\'hommes et tireur d\'élite.'
    },
    { 
      name: 'Firas Lahyani', number: 15, position: 'Pivot', sport: 'basketball', 
      nationality: 'Tunisien', age: 33, height: '2m08', weight: '100kg',
      imageUrl: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=500',
      bio: 'Expert des rebonds et protecteur de panier exceptionnel.'
    },
    { 
      name: 'Mourad El Mabrouk', number: 10, position: 'Arrière', sport: 'basketball', 
      nationality: 'Tunisien', age: 38, height: '1m89', weight: '85kg',
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
      bio: 'Le sniper de l\'équipe, redoutable derrière la ligne des 3 points.'
    },
  ]);
  console.log('✅ Seeded players');

  // Objectives (Crowdfunding)
  const objRepo = AppDataSource.getRepository('objectives');
  await objRepo.save([
    { 
      title: 'Nouveau Centre de Formation', 
      description: 'Aidez-nous à construire des installations de classe mondiale pour nos jeunes talents. Ce projet comprend des terrains hybrides et un centre médical de pointe.',
      targetAmount: 250000,
      currentAmount: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200',
      status: 'open'
    },
    { 
      title: 'Bus Officiel USM', 
      description: 'L\'équipe première a besoin d\'un nouveau bus ultra-moderne pour ses déplacements à travers la Tunisie. Confort et sécurité pour nos joueurs.',
      targetAmount: 180000,
      currentAmount: 125000,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200',
      status: 'open'
    }
  ]);
  console.log('✅ Seeded objectives');

  // Giveaways (Lucky Draws)
  const giveawayRepo = AppDataSource.getRepository('giveaways');
  const monthFromNow = new Date();
  monthFromNow.setMonth(monthFromNow.getMonth() + 1);
  await giveawayRepo.save([
    {
      title: 'Une Journée avec le Capitaine',
      description: 'Gagnez la chance de passer une journée complète avec le capitaine du club. Entraînement, déjeuner et visite du stade au programme !',
      pointsCost: 100,
      endDate: monthFromNow,
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      isActive: true,
      maxWinners: 1
    },
    {
      title: 'Accès VIP Match à Domicile',
      description: 'Deux places en loge VIP pour le prochain grand derby, avec accès aux coulisses.',
      pointsCost: 50,
      endDate: monthFromNow,
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      isActive: true,
      maxWinners: 2
    }
  ]);
  console.log('✅ Seeded giveaways');

  // Update semi-finished matches with real-looking replays
  const matchesToUpdate = await matchRepo.find({ where: { status: 'ended' as any } });
  for (const m of matchesToUpdate) {
    if (!m.replayUrl || m.replayUrl.includes('example.com')) {
      await matchRepo.update(m.id, { 
        replayUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800'
      });
    }
  }

  await AppDataSource.destroy();
  console.log('🎉 Database seeding complete!');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
