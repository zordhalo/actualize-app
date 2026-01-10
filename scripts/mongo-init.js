// MongoDB initialization script
db = db.getSiblingDB('actualize');

// Create collections
db.createCollection('assessments');
db.createCollection('questions');
db.createCollection('users');
db.createCollection('results');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.assessments.createIndex({ createdAt: -1 });
db.questions.createIndex({ assessmentId: 1 });
db.results.createIndex({ userId: 1, assessmentId: 1 });

print('Database initialized successfully!');
