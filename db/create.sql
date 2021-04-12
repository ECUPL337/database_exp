CREATE TABLE "Admin"
(
    "ID"       INTEGER NOT NULL UNIQUE,
    "Login"    TEXT    NOT NULL UNIQUE,
    "Password" TEXT    NOT NULL,
    "Level"    INTEGER NOT NULL DEFAULT 1 CHECK ("Level" > 0),
    PRIMARY KEY ("ID" AUTOINCREMENT)
);

CREATE TABLE "Customer"
(
    "CID"       INTEGER NOT NULL UNIQUE,
    "CLogin"    TEXT    NOT NULL UNIQUE,
    "CPassword" TEXT    NOT NULL,
    "CPhone"    INTEGER NOT NULL UNIQUE,
    "CBirthday" TEXT    NOT NULL,
    "CWork"     INTEGER NOT NULL,
    "CCredit"   NUMERIC NOT NULL DEFAULT 0,
    "CLevel"    INTEGER NOT NULL DEFAULT 0,
    "CRegDate"  TEXT    NOT NULL DEFAULT '2021-01-01',
    "CName"     TEXT    NOT NULL,
    "CSum"      NUMERIC NOT NULL DEFAULT 0,
    PRIMARY KEY ("CID" AUTOINCREMENT),
    FOREIGN KEY ("CLevel") REFERENCES "Discount" ("CLevel") ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE TABLE "Discount"
(
    "CLevel"   INTEGER NOT NULL UNIQUE,
    "Discount" NUMERIC NOT NULL,
    "Floor"    NUMERIC NOT NULL,
    "Ceiling"  NUMERIC NOT NULL,
    PRIMARY KEY ("CLevel")
);

CREATE TABLE "Goods"
(
    "GID"    INTEGER NOT NULL UNIQUE,
    "GName"  TEXT    NOT NULL UNIQUE,
    "GPrice" NUMERIC NOT NULL,
    "GKind"  TEXT    NOT NULL,
    PRIMARY KEY ("GID" AUTOINCREMENT)
);

CREATE TABLE "DiscountedGoods"
(
    "GID"           INTEGER NOT NULL UNIQUE,
    "DGPrice"       NUMERIC NOT NULL,
    "DGExpiredDate" TEXT    NOT NULL,
    PRIMARY KEY ("GID"),
    FOREIGN KEY ("GID") REFERENCES "Goods" ("GID") ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE TABLE "Purchase"
(
    "PNo"     INTEGER NOT NULL UNIQUE,
    "CID"     INTEGER NOT NULL,
    "GID"     INTEGER NOT NULL,
    "PAmount" INTEGER NOT NULL CHECK ("PAmount" > 0),
    "PTime"   TEXT    NOT NULL,
    "PMoney"  NUMERIC NOT NULL,
    PRIMARY KEY ("PNo" AUTOINCREMENT),
    FOREIGN KEY ("GID") REFERENCES "Goods" ("GID") ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY ("CID") REFERENCES "Customer" ("CID") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Redeem"
(
    "RID"     INTEGER NOT NULL UNIQUE,
    "CID"     INTEGER NOT NULL,
    "GID"     INTEGER NOT NULL,
    "RAmount" INTEGER NOT NULL CHECK ("RAmount" > 0),
    "RCredit" INTEGER NOT NULL,
    PRIMARY KEY ("RID" AUTOINCREMENT),
    FOREIGN KEY ("GID") REFERENCES "Goods" ("GID") ON DELETE NO ACTION ON UPDATE CASCADE,
    FOREIGN KEY ("CID") REFERENCES "Customer" ("CID") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "RedeemGoods"
(
    "GID"      INTEGER NOT NULL,
    "RGCredit" INTEGER NOT NULL DEFAULT 0 CHECK ("RGCredit" >= 0),
    PRIMARY KEY ("GID"),
    FOREIGN KEY ("GID") REFERENCES "Goods" ("GID") ON UPDATE CASCADE ON DELETE NO ACTION
);

