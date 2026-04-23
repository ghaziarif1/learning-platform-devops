// Connexion à la base users_db
db = db.getSiblingDB('users_db');

// Création de la collection users avec validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: { bsonType: 'string' },
        role: {
          bsonType: 'string',
          enum: ['student', 'instructor', 'admin']
        }
      }
    }
  }
});

// Index unique sur email
db.users.createIndex({ email: 1 }, { unique: true });

// Création de la collection profiles
db.createCollection('profiles');
db.profiles.createIndex({ userId: 1 }, { unique: true });

// Création de la collection feedbacks
db.createCollection('feedbacks');
db.feedbacks.createIndex({ courseId: 1 });
db.feedbacks.createIndex({ userId: 1 });

print('✅ MongoDB initialisé avec succès');