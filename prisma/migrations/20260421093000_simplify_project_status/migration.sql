ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";

CREATE TYPE "ProjectStatus" AS ENUM ('NOT_UPLOADED', 'IN_PROGRESS');

ALTER TABLE "Project"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ProjectStatus"
  USING (
    CASE
      WHEN "status"::text = 'DRAFT' THEN 'NOT_UPLOADED'::"ProjectStatus"
      ELSE 'IN_PROGRESS'::"ProjectStatus"
    END
  );

ALTER TABLE "Project"
  ALTER COLUMN "status" SET DEFAULT 'NOT_UPLOADED';

DROP TYPE "ProjectStatus_old";
