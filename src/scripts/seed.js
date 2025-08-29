import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Experience from '../models/Experience.js';
import Skill from '../models/Skill.js';
import Certification from '../models/Certification.js';
import Social from '../models/Social.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Experience.deleteMany({});
    await Skill.deleteMany({});
    await Certification.deleteMany({});
    await Social.deleteMany({});
    console.log('🗑️  Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Seed user data
const seedUser = async () => {
  try {
    const user = await User.create({
      name: 'Mahmoud Ahmed',
      email: 'mahmoudabuelazem2467@gmail.com',
      password: 'admin123456',
      phone: '01021288238',
      bio: 'Passionate Flutter Developer with expertise in mobile app development, state management, and modern UI/UX design. I love creating beautiful, functional, and user-friendly applications.',
      location: 'Mansoura, Egypt',
      role: 'admin',
      isActive: true
    });
    console.log('👤 User seeded:', user.name);
    return user;
  } catch (error) {
    console.error('Error seeding user:', error);
  }
};

// Seed projects data
const seedProjects = async () => {
  try {
    const projects = [
      {
        title: 'Wanna Meal',
        description: 'A comprehensive food delivery application built with Flutter. Features include user authentication, restaurant listings, menu management, order tracking, and payment integration.',
        cover: {
          url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
          public_id: 'portfolio/wanna-meal-cover'
        },
        gallery: [
          {
            url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
            public_id: 'portfolio/wanna-meal-1',
            caption: 'Home Screen - Restaurant Listings'
          },
          {
            url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
            public_id: 'portfolio/wanna-meal-2',
            caption: 'Menu Selection Interface'
          },
          {
            url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
            public_id: 'portfolio/wanna-meal-3',
            caption: 'Order Tracking System'
          },
          {
            url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
            public_id: 'portfolio/wanna-meal-4',
            caption: 'Payment Integration'
          }
        ],
        techStack: ['Flutter', 'Dart', 'Firebase', 'Provider', 'Google Maps'],
        role: 'Full Stack Developer',
        year: 2024,
        type: 'mobile',
        features: [
          'User authentication and profile management',
          'Restaurant discovery and menu browsing',
          'Real-time order tracking',
          'Payment integration with multiple gateways',
          'Push notifications for order updates',
          'Offline support with local storage'
        ],
        links: {
          github: 'https://github.com/MahmoudAbuelazm/wanna-meal',
          demo: 'https://wanna-meal-demo.web.app'
        },
        stats: {
          downloads: 1500,
          rating: 4.8,
          users: 1200
        },
        caseStudy: {
          problem: 'Users needed a reliable and fast food delivery service with real-time tracking and multiple payment options.',
          solution: 'Developed a Flutter app with Firebase backend, implementing Provider for state management and Google Maps for location services.',
          architecture: 'MVVM architecture with clean separation of concerns. Used Firebase for backend services including authentication, database, and cloud functions.',
          stateManagement: 'Provider pattern for state management with multiple providers for user, cart, and order states.',
          challenges: [
            'Implementing real-time order tracking',
            'Optimizing app performance for large menu lists',
            'Handling offline scenarios gracefully'
          ],
          results: 'Successfully launched with 1500+ downloads and 4.8-star rating. Reduced order processing time by 40%.'
        },
        isFeatured: true,
        isPublished: true
      },
      {
        title: 'Movie & TV Explorer',
        description: 'A movie and TV show discovery app that allows users to browse, search, and get detailed information about movies and TV series.',
        cover: {
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop',
          public_id: 'portfolio/movie-explorer-cover'
        },
        gallery: [
          {
            url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop',
            public_id: 'portfolio/movie-explorer-1',
            caption: 'Movie Discovery Home'
          },
          {
            url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=600&fit=crop',
            public_id: 'portfolio/movie-explorer-2',
            caption: 'Detailed Movie Information'
          },
          {
            url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop',
            public_id: 'portfolio/movie-explorer-3',
            caption: 'Search and Filter Interface'
          }
        ],
        techStack: ['Flutter', 'Dart', 'TMDB API', 'Bloc', 'Hive'],
        role: 'Frontend Developer',
        year: 2024,
        type: 'mobile',
        features: [
          'Browse movies and TV shows by categories',
          'Search functionality with filters',
          'Detailed information and cast details',
          'Watchlist and favorites management',
          'Offline data storage',
          'Dark/Light theme support'
        ],
        links: {
          github: 'https://github.com/MahmoudAbuelazm/movie-explorer',
          demo: 'https://movie-explorer-demo.web.app'
        },
        stats: {
          downloads: 800,
          rating: 4.6,
          users: 650
        },
        caseStudy: {
          problem: 'Users wanted a comprehensive movie and TV show discovery app with offline capabilities and modern UI.',
          solution: 'Built a Flutter app using Bloc for state management, integrated TMDB API, and implemented Hive for local storage.',
          architecture: 'Clean architecture with Bloc pattern. Used TMDB API for data and Hive for local storage.',
          stateManagement: 'Bloc pattern with separate blocs for movies, TV shows, and user preferences.',
          challenges: [
            'Managing complex state with multiple data sources',
            'Implementing efficient search and filtering',
            'Optimizing image loading and caching'
          ],
          results: 'App launched with 800+ downloads and 4.6-star rating. Users praised the smooth UI and offline functionality.'
        },
        isFeatured: true,
        isPublished: true
      },
      {
        title: 'Bookly',
        description: 'A book reading and management app that helps users discover, organize, and track their reading progress.',
        cover: {
          url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
          public_id: 'portfolio/bookly-cover'
        },
        gallery: [
          {
            url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
            public_id: 'portfolio/bookly-1',
            caption: 'Book Library Interface'
          },
          {
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
            public_id: 'portfolio/bookly-2',
            caption: 'Reading Progress Tracking'
          },
          {
            url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
            public_id: 'portfolio/bookly-3',
            caption: 'Book Recommendations'
          }
        ],
        techStack: ['Flutter', 'Dart', 'Firebase', 'Cubit', 'Google Books API'],
        role: 'Full Stack Developer',
        year: 2023,
        type: 'mobile',
        features: [
          'Book discovery and search',
          'Reading progress tracking',
          'Personal library management',
          'Reading statistics and insights',
          'Social features and recommendations',
          'Cross-platform synchronization'
        ],
        links: {
          github: 'https://github.com/MahmoudAbuelazm/bookly',
          demo: 'https://bookly-demo.web.app'
        },
        stats: {
          downloads: 1200,
          rating: 4.7,
          users: 950
        },
        caseStudy: {
          problem: 'Readers needed a comprehensive app to manage their reading habits, track progress, and discover new books.',
          solution: 'Developed a Flutter app with Firebase backend, integrating Google Books API for book data and Cubit for state management.',
          architecture: 'MVVM architecture with Firebase backend. Used Google Books API for book information and Firebase for user data.',
          stateManagement: 'Cubit pattern for simpler state management compared to Bloc, with separate cubits for books, user, and reading progress.',
          challenges: [
            'Integrating multiple APIs efficiently',
            'Designing intuitive reading progress tracking',
              'Implementing social features and recommendations'
          ],
          results: 'Successfully launched with 1200+ downloads and 4.7-star rating. Users particularly liked the reading progress tracking feature.'
        },
        isFeatured: false,
        isPublished: true
      },
      {
        title: 'QuickNotes',
        description: 'A fast and efficient note-taking app with rich text editing, organization features, and cloud synchronization.',
        cover: {
          url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
          public_id: 'portfolio/quicknotes-cover'
        },
        gallery: [
          {
            url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
            public_id: 'portfolio/quicknotes-1',
            caption: 'Rich Text Editing'
          },
          {
            url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
            public_id: 'portfolio/quicknotes-2',
            caption: 'Note Organization'
          },
          {
            url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
            public_id: 'portfolio/quicknotes-3',
            caption: 'Cloud Synchronization'
          }
        ],
        techStack: ['Flutter', 'Dart', 'SQLite', 'Provider', 'File Picker'],
        role: 'Mobile Developer',
        year: 2023,
        type: 'mobile',
        features: [
          'Rich text editing with formatting options',
          'Note organization with folders and tags',
          'Search and filter functionality',
          'Image and file attachments',
          'Offline-first design',
          'Export and sharing options'
        ],
        links: {
          github: 'https://github.com/MahmoudAbuelazm/quicknotes',
          demo: 'https://quicknotes-demo.web.app'
        },
        stats: {
          downloads: 2000,
          rating: 4.5,
          users: 1800
        },
        caseStudy: {
          problem: 'Users needed a fast, reliable note-taking app that works offline and provides rich editing capabilities.',
          solution: 'Built a Flutter app with SQLite for local storage, implementing Provider for state management and rich text editing.',
          architecture: 'Local-first architecture with SQLite database. Used Provider for state management and implemented file system integration.',
          stateManagement: 'Provider pattern with multiple providers for notes, folders, and app settings.',
          challenges: [
            'Implementing rich text editing in Flutter',
            'Managing large amounts of local data efficiently',
            'Creating intuitive organization features'
          ],
          results: 'App launched with 2000+ downloads and 4.5-star rating. Users appreciated the fast performance and offline functionality.'
        },
        isFeatured: false,
        isPublished: true
      },
      {
        title: 'Chatty',
        description: 'A real-time messaging app with group chat functionality, file sharing, and end-to-end encryption.',
        cover: {
          url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop',
          public_id: 'portfolio/chatty-cover'
        },
        gallery: [
          {
            url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop',
            public_id: 'portfolio/chatty-1',
            caption: 'Group Chat Interface'
          },
          {
            url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop',
            public_id: 'portfolio/chatty-2',
            caption: 'File Sharing'
          },
          {
            url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop',
            public_id: 'portfolio/chatty-3',
            caption: 'End-to-End Encryption'
          }
        ],
        techStack: ['Flutter', 'Dart', 'Firebase', 'WebRTC', 'Provider'],
        role: 'Full Stack Developer',
        year: 2023,
        type: 'mobile',
        features: [
          'Real-time messaging with typing indicators',
          'Group chat creation and management',
          'File and media sharing',
          'Voice and video calls',
          'Message encryption',
          'Push notifications'
        ],
        links: {
          github: 'https://github.com/MahmoudAbuelazm/chatty',
          demo: 'https://chatty-demo.web.app'
        },
        stats: {
          downloads: 3000,
          rating: 4.4,
          users: 2500
        },
        caseStudy: {
          problem: 'Users needed a secure, real-time messaging app with group chat and multimedia sharing capabilities.',
          solution: 'Developed a Flutter app with Firebase backend, implementing WebRTC for calls and real-time messaging features.',
          architecture: 'Real-time architecture with Firebase Firestore and WebRTC for communication. Used Provider for state management.',
          stateManagement: 'Provider pattern with separate providers for chat, user, and call states.',
          challenges: [
            'Implementing real-time messaging efficiently',
            'Managing WebRTC connections for calls',
            'Ensuring message delivery and synchronization'
          ],
          results: 'Successfully launched with 3000+ downloads and 4.4-star rating. Real-time features work smoothly across different network conditions.'
        },
        isFeatured: false,
        isPublished: true
      }
    ];

    for (const project of projects) {
      await Project.create(project);
    }
    console.log('📱 Projects seeded:', projects.length);
  } catch (error) {
    console.error('Error seeding projects:', error);
  }
};

// Seed experiences data
const seedExperiences = async () => {
  try {
    const experiences = [
      {
        company: 'The Gate 1',
        role: 'Flutter Developer',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-09-30'),
        description: [
          'Developed and maintained the Estgmam app using Flutter framework',
          'Implemented Cubit/Bloc state management for complex app state',
          'Integrated Google Maps API for location-based features',
          'Collaborated with UI/UX designers to implement pixel-perfect designs',
          'Optimized app performance and reduced loading times by 30%',
          'Participated in code reviews and mentored junior developers'
        ],
        tech: ['Flutter', 'Dart', 'Cubit', 'Bloc', 'Google Maps', 'Firebase'],
        location: 'Remote',
        isCurrent: false,
        isPublished: true
      },
      {
        company: 'Leapro',
        role: 'Flutter Developer',
        startDate: new Date('2023-11-01'),
        endDate: new Date('2024-06-30'),
        description: [
          'Built and maintained multiple Flutter applications using Provider state management',
          'Implemented MVVM architecture for scalable and maintainable code',
          'Developed advanced state management solutions for complex app requirements',
          'Integrated third-party APIs and services for enhanced functionality',
          'Conducted performance optimization and debugging for production apps',
          'Worked closely with backend developers for API integration'
        ],
        tech: ['Flutter', 'Dart', 'Provider', 'MVVM', 'REST APIs', 'Git'],
        location: 'Remote',
        isCurrent: false,
        isPublished: true
      },
      {
        company: 'ITI Training',
        role: 'Flutter Trainee',
        startDate: new Date('2023-08-01'),
        endDate: new Date('2023-09-30'),
        description: [
          'Completed intensive Flutter and Dart training program',
          'Built a Quiz app as a final project demonstrating learned concepts',
          'Learned Firebase integration for backend services',
          'Practiced Git and GitHub for version control',
          'Participated in team projects and code reviews',
          'Gained hands-on experience with real-world development practices'
        ],
        tech: ['Flutter', 'Dart', 'Firebase', 'Git', 'GitHub'],
        location: 'Mansoura, Egypt',
        isCurrent: false,
        isPublished: true
      }
    ];

    for (const experience of experiences) {
      await Experience.create(experience);
    }
    console.log('💼 Experiences seeded:', experiences.length);
  } catch (error) {
    console.error('Error seeding experiences:', error);
  }
};

// Seed skills data
const seedSkills = async () => {
  try {
    const skills = [
      // Languages
      { name: 'C++', category: 'Languages', level: 85, icon: 'devicon-cplusplus-plain', color: '#00599C', order: 1 },
      { name: 'Dart', category: 'Languages', level: 90, icon: 'devicon-dart-plain', color: '#00D4AA', order: 2 },
      { name: 'HTML', category: 'Languages', level: 80, icon: 'devicon-html5-plain', color: '#E34F26', order: 3 },
      { name: 'CSS', category: 'Languages', level: 75, icon: 'devicon-css3-plain', color: '#1572B6', order: 4 },
      
      // Frameworks
      { name: 'Flutter', category: 'Frameworks', level: 95, icon: 'devicon-flutter-plain', color: '#02569B', order: 1 },
      
      // Tools
      { name: 'Firebase', category: 'Tools', level: 85, icon: 'devicon-firebase-plain', color: '#FFCA28', order: 1 },
      { name: 'Git', category: 'Tools', level: 80, icon: 'devicon-git-plain', color: '#F05032', order: 2 },
      { name: 'GitHub', category: 'Tools', level: 85, icon: 'devicon-github-original', color: '#181717', order: 3 },
      { name: 'Hive', category: 'Tools', level: 75, icon: 'devicon-database-plain', color: '#FF6B35', order: 4 },
      
      // Databases
      { name: 'SQLite', category: 'Databases', level: 70, icon: 'devicon-sqlite-plain', color: '#003B57', order: 1 },
      { name: 'Firestore', category: 'Databases', level: 80, icon: 'devicon-firebase-plain', color: '#FFCA28', order: 2 }
    ];

    for (const skill of skills) {
      await Skill.create(skill);
    }
    console.log('🛠️  Skills seeded:', skills.length);
  } catch (error) {
    console.error('Error seeding skills:', error);
  }
};

// Seed certifications data
const seedCertifications = async () => {
  try {
    const certifications = [
      {
        title: 'Flutter Development Bootcamp',
        issuer: 'ITI Training',
        date: new Date('2023-09-30'),
        credentialUrl: 'https://iti.gov.eg/certificates/flutter-bootcamp',
        description: 'Comprehensive Flutter and Dart development training with hands-on projects',
        order: 1
      },
      {
        title: 'Firebase for Flutter Developers',
        issuer: 'Google Developers',
        date: new Date('2023-08-15'),
        credentialUrl: 'https://developers.google.com/certification/firebase-flutter',
        description: 'Advanced Firebase integration and backend services for Flutter applications',
        order: 2
      },
      {
        title: 'Mobile App Development Fundamentals',
        issuer: 'Coursera',
        date: new Date('2023-06-20'),
        credentialUrl: 'https://coursera.org/verify/mobile-dev-fundamentals',
        description: 'Core concepts of mobile app development and user experience design',
        order: 3
      }
    ];

    for (const certification of certifications) {
      await Certification.create(certification);
    }
    console.log('🏆 Certifications seeded:', certifications.length);
  } catch (error) {
    console.error('Error seeding certifications:', error);
  }
};

// Seed socials data
const seedSocials = async () => {
  try {
    const socials = [
      {
        platform: 'GitHub',
        url: 'https://github.com/MahmoudAbuelazm',
        icon: 'devicon-github-original',
        color: '#181717',
        order: 1
      },
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/mahmoud-abu-elazem',
        icon: 'devicon-linkedin-plain',
        color: '#0077B5',
        order: 2
      },
      {
        platform: 'Twitter',
        url: 'https://twitter.com/mahmoud_abuelazm',
        icon: 'devicon-twitter-original',
        color: '#1DA1F2',
        order: 3
      },
      {
        platform: 'Email',
        url: 'mailto:mahmoudabuelazem2467@gmail.com',
        icon: 'devicon-google-plain',
        color: '#EA4335',
        order: 4
      }
    ];

    for (const social of socials) {
      await Social.create(social);
    }
    console.log('🔗 Socials seeded:', socials.length);
  } catch (error) {
    console.error('Error seeding socials:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearData();
    
    await seedUser();
    await seedProjects();
    await seedExperiences();
    await seedSkills();
    await seedCertifications();
    await seedSocials();
    
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();
