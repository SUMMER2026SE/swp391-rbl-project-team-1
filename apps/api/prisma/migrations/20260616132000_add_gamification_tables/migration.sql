-- CreateTable
CREATE TABLE "StudentProfile" (
    "studentId" INTEGER NOT NULL,
    "grade" INTEGER NOT NULL,
    "province" TEXT NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "DailyContribution" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "exerciseCount" INTEGER NOT NULL DEFAULT 0,
    "examsCompleted" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "studyMinutes" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "subjectsStudied" JSONB NOT NULL,

    CONSTRAINT "DailyContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectStreak" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3),

    CONSTRAINT "SubjectStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardSnapshot" (
    "id" SERIAL NOT NULL,
    "dimensionKey" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "xp" INTEGER NOT NULL,
    "streakDays" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyContribution_userId_date_idx" ON "DailyContribution"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyContribution_userId_date_key" ON "DailyContribution"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectStreak_userId_subject_key" ON "SubjectStreak"("userId", "subject");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_dimensionKey_rank_idx" ON "LeaderboardSnapshot"("dimensionKey", "rank");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyContribution" ADD CONSTRAINT "DailyContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectStreak" ADD CONSTRAINT "SubjectStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardSnapshot" ADD CONSTRAINT "LeaderboardSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
