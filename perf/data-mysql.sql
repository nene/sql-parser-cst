/*******************************************************************************
   Chinook Database - Version 1.4
   Script: Chinook_MySql.sql
   Description: Creates and populates the Chinook database.
   DB Server: MySql
   Author: Luis Rocha
   License: http://www.codeplex.com/ChinookDatabase/license
********************************************************************************/

/*******************************************************************************
   Create Tables
********************************************************************************/
CREATE TABLE `Album`
(
    `AlbumId` INT NOT NULL,
    `Title` NVARCHAR(160) NOT NULL,
    `ArtistId` INT NOT NULL,
    CONSTRAINT `PK_Album` PRIMARY KEY  (`AlbumId`)
);

CREATE TABLE `Artist`
(
    `ArtistId` INT NOT NULL,
    `Name` NVARCHAR(120),
    CONSTRAINT `PK_Artist` PRIMARY KEY  (`ArtistId`)
);

CREATE TABLE `Customer`
(
    `CustomerId` INT NOT NULL,
    `FirstName` NVARCHAR(40) NOT NULL,
    `LastName` NVARCHAR(20) NOT NULL,
    `Company` NVARCHAR(80),
    `Address` NVARCHAR(70),
    `City` NVARCHAR(40),
    `State` NVARCHAR(40),
    `Country` NVARCHAR(40),
    `PostalCode` NVARCHAR(10),
    `Phone` NVARCHAR(24),
    `Fax` NVARCHAR(24),
    `Email` NVARCHAR(60) NOT NULL,
    `SupportRepId` INT,
    CONSTRAINT `PK_Customer` PRIMARY KEY  (`CustomerId`)
);

CREATE TABLE `Employee`
(
    `EmployeeId` INT NOT NULL,
    `LastName` NVARCHAR(20) NOT NULL,
    `FirstName` NVARCHAR(20) NOT NULL,
    `Title` NVARCHAR(30),
    `ReportsTo` INT,
    `BirthDate` DATETIME,
    `HireDate` DATETIME,
    `Address` NVARCHAR(70),
    `City` NVARCHAR(40),
    `State` NVARCHAR(40),
    `Country` NVARCHAR(40),
    `PostalCode` NVARCHAR(10),
    `Phone` NVARCHAR(24),
    `Fax` NVARCHAR(24),
    `Email` NVARCHAR(60),
    CONSTRAINT `PK_Employee` PRIMARY KEY  (`EmployeeId`)
);

CREATE TABLE `Genre`
(
    `GenreId` INT NOT NULL,
    `Name` NVARCHAR(120),
    CONSTRAINT `PK_Genre` PRIMARY KEY  (`GenreId`)
);

CREATE TABLE `Invoice`
(
    `InvoiceId` INT NOT NULL,
    `CustomerId` INT NOT NULL,
    `InvoiceDate` DATETIME NOT NULL,
    `BillingAddress` NVARCHAR(70),
    `BillingCity` NVARCHAR(40),
    `BillingState` NVARCHAR(40),
    `BillingCountry` NVARCHAR(40),
    `BillingPostalCode` NVARCHAR(10),
    `Total` NUMERIC(10,2) NOT NULL,
    CONSTRAINT `PK_Invoice` PRIMARY KEY  (`InvoiceId`)
);

CREATE TABLE `InvoiceLine`
(
    `InvoiceLineId` INT NOT NULL,
    `InvoiceId` INT NOT NULL,
    `TrackId` INT NOT NULL,
    `UnitPrice` NUMERIC(10,2) NOT NULL,
    `Quantity` INT NOT NULL,
    CONSTRAINT `PK_InvoiceLine` PRIMARY KEY  (`InvoiceLineId`)
);

CREATE TABLE `MediaType`
(
    `MediaTypeId` INT NOT NULL,
    `Name` NVARCHAR(120),
    CONSTRAINT `PK_MediaType` PRIMARY KEY  (`MediaTypeId`)
);

CREATE TABLE `Playlist`
(
    `PlaylistId` INT NOT NULL,
    `Name` NVARCHAR(120),
    CONSTRAINT `PK_Playlist` PRIMARY KEY  (`PlaylistId`)
);

CREATE TABLE `PlaylistTrack`
(
    `PlaylistId` INT NOT NULL,
    `TrackId` INT NOT NULL,
    CONSTRAINT `PK_PlaylistTrack` PRIMARY KEY  (`PlaylistId`, `TrackId`)
);

CREATE TABLE `Track`
(
    `TrackId` INT NOT NULL,
    `Name` NVARCHAR(200) NOT NULL,
    `AlbumId` INT,
    `MediaTypeId` INT NOT NULL,
    `GenreId` INT,
    `Composer` NVARCHAR(220),
    `Milliseconds` INT NOT NULL,
    `Bytes` INT,
    `UnitPrice` NUMERIC(10,2) NOT NULL,
    CONSTRAINT `PK_Track` PRIMARY KEY  (`TrackId`)
);



/*******************************************************************************
   Create Primary Key Unique Indexes
********************************************************************************/

/*******************************************************************************
   Create Foreign Keys
********************************************************************************/
CREATE INDEX `IFK_AlbumArtistId` ON `Album` (`ArtistId`);

CREATE INDEX `IFK_CustomerSupportRepId` ON `Customer` (`SupportRepId`);

CREATE INDEX `IFK_EmployeeReportsTo` ON `Employee` (`ReportsTo`);

CREATE INDEX `IFK_InvoiceCustomerId` ON `Invoice` (`CustomerId`);

CREATE INDEX `IFK_InvoiceLineInvoiceId` ON `InvoiceLine` (`InvoiceId`);

CREATE INDEX `IFK_InvoiceLineTrackId` ON `InvoiceLine` (`TrackId`);

CREATE INDEX `IFK_PlaylistTrackTrackId` ON `PlaylistTrack` (`TrackId`);

CREATE INDEX `IFK_TrackAlbumId` ON `Track` (`AlbumId`);

CREATE INDEX `IFK_TrackGenreId` ON `Track` (`GenreId`);

CREATE INDEX `IFK_TrackMediaTypeId` ON `Track` (`MediaTypeId`);


/*******************************************************************************
   Populate Tables
********************************************************************************/
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (1, N'Rock');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (2, N'Jazz');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (3, N'Metal');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (4, N'Alternative & Punk');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (5, N'Rock And Roll');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (6, N'Blues');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (7, N'Latin');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (8, N'Reggae');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (9, N'Pop');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (10, N'Soundtrack');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (11, N'Bossa Nova');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (12, N'Easy Listening');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (13, N'Heavy Metal');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (14, N'R&B/Soul');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (15, N'Electronica/Dance');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (16, N'World');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (17, N'Hip Hop/Rap');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (18, N'Science Fiction');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (19, N'TV Shows');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (20, N'Sci Fi & Fantasy');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (21, N'Drama');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (22, N'Comedy');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (23, N'Alternative');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (24, N'Classical');
INSERT INTO `Genre` (`GenreId`, `Name`) VALUES (25, N'Opera');

INSERT INTO `MediaType` (`MediaTypeId`, `Name`) VALUES (1, N'MPEG audio file');
INSERT INTO `MediaType` (`MediaTypeId`, `Name`) VALUES (2, N'Protected AAC audio file');
INSERT INTO `MediaType` (`MediaTypeId`, `Name`) VALUES (3, N'Protected MPEG-4 video file');
INSERT INTO `MediaType` (`MediaTypeId`, `Name`) VALUES (4, N'Purchased AAC audio file');
INSERT INTO `MediaType` (`MediaTypeId`, `Name`) VALUES (5, N'AAC audio file');

INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (1, N'AC/DC');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (2, N'Accept');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (3, N'Aerosmith');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (4, N'Alanis Morissette');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (5, N'Alice In Chains');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (6, N'Antônio Carlos Jobim');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (7, N'Apocalyptica');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (8, N'Audioslave');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (9, N'BackBeat');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (10, N'Billy Cobham');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (11, N'Black Label Society');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (12, N'Black Sabbath');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (13, N'Body Count');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (14, N'Bruce Dickinson');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (15, N'Buddy Guy');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (16, N'Caetano Veloso');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (17, N'Chico Buarque');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (18, N'Chico Science & Nação Zumbi');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (19, N'Cidade Negra');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (20, N'Cláudio Zoli');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (21, N'Various Artists');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (22, N'Led Zeppelin');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (23, N'Frank Zappa & Captain Beefheart');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (24, N'Marcos Valle');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (25, N'Milton Nascimento & Bebeto');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (26, N'Azymuth');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (27, N'Gilberto Gil');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (28, N'João Gilberto');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (29, N'Bebel Gilberto');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (30, N'Jorge Vercilo');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (31, N'Baby Consuelo');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (32, N'Ney Matogrosso');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (33, N'Luiz Melodia');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (34, N'Nando Reis');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (35, N'Pedro Luís & A Parede');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (36, N'O Rappa');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (37, N'Ed Motta');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (38, N'Banda Black Rio');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (39, N'Fernanda Porto');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (40, N'Os Cariocas');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (41, N'Elis Regina');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (42, N'Milton Nascimento');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (43, N'A Cor Do Som');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (44, N'Kid Abelha');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (45, N'Sandra De Sá');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (46, N'Jorge Ben');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (47, N'Hermeto Pascoal');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (48, N'Barão Vermelho');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (49, N'Edson, DJ Marky & DJ Patife Featuring Fernanda Porto');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (50, N'Metallica');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (51, N'Queen');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (52, N'Kiss');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (53, N'Spyro Gyra');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (54, N'Green Day');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (55, N'David Coverdale');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (56, N'Gonzaguinha');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (57, N'Os Mutantes');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (58, N'Deep Purple');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (59, N'Santana');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (60, N'Santana Feat. Dave Matthews');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (61, N'Santana Feat. Everlast');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (62, N'Santana Feat. Rob Thomas');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (63, N'Santana Feat. Lauryn Hill & Cee-Lo');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (64, N'Santana Feat. The Project G&B');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (65, N'Santana Feat. Maná');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (66, N'Santana Feat. Eagle-Eye Cherry');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (67, N'Santana Feat. Eric Clapton');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (68, N'Miles Davis');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (69, N'Gene Krupa');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (70, N'Toquinho & Vinícius');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (71, N'Vinícius De Moraes & Baden Powell');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (72, N'Vinícius De Moraes');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (73, N'Vinícius E Qurteto Em Cy');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (74, N'Vinícius E Odette Lara');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (75, N'Vinicius, Toquinho & Quarteto Em Cy');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (76, N'Creedence Clearwater Revival');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (77, N'Cássia Eller');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (78, N'Def Leppard');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (79, N'Dennis Chambers');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (80, N'Djavan');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (81, N'Eric Clapton');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (82, N'Faith No More');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (83, N'Falamansa');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (84, N'Foo Fighters');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (85, N'Frank Sinatra');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (86, N'Funk Como Le Gusta');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (87, N'Godsmack');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (88, N'Guns N'' Roses');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (89, N'Incognito');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (90, N'Iron Maiden');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (91, N'James Brown');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (92, N'Jamiroquai');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (93, N'JET');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (94, N'Jimi Hendrix');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (95, N'Joe Satriani');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (96, N'Jota Quest');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (97, N'João Suplicy');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (98, N'Judas Priest');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (99, N'Legião Urbana');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (100, N'Lenny Kravitz');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (101, N'Lulu Santos');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (102, N'Marillion');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (103, N'Marisa Monte');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (104, N'Marvin Gaye');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (105, N'Men At Work');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (106, N'Motörhead');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (107, N'Motörhead & Girlschool');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (108, N'Mônica Marianno');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (109, N'Mötley Crüe');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (110, N'Nirvana');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (111, N'O Terço');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (112, N'Olodum');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (113, N'Os Paralamas Do Sucesso');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (114, N'Ozzy Osbourne');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (115, N'Page & Plant');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (116, N'Passengers');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (117, N'Paul D''Ianno');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (118, N'Pearl Jam');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (119, N'Peter Tosh');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (120, N'Pink Floyd');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (121, N'Planet Hemp');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (122, N'R.E.M. Feat. Kate Pearson');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (123, N'R.E.M. Feat. KRS-One');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (124, N'R.E.M.');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (125, N'Raimundos');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (126, N'Raul Seixas');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (127, N'Red Hot Chili Peppers');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (128, N'Rush');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (129, N'Simply Red');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (130, N'Skank');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (131, N'Smashing Pumpkins');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (132, N'Soundgarden');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (133, N'Stevie Ray Vaughan & Double Trouble');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (134, N'Stone Temple Pilots');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (135, N'System Of A Down');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (136, N'Terry Bozzio, Tony Levin & Steve Stevens');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (137, N'The Black Crowes');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (138, N'The Clash');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (139, N'The Cult');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (140, N'The Doors');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (141, N'The Police');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (142, N'The Rolling Stones');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (143, N'The Tea Party');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (144, N'The Who');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (145, N'Tim Maia');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (146, N'Titãs');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (147, N'Battlestar Galactica');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (148, N'Heroes');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (149, N'Lost');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (150, N'U2');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (151, N'UB40');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (152, N'Van Halen');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (153, N'Velvet Revolver');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (154, N'Whitesnake');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (155, N'Zeca Pagodinho');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (156, N'The Office');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (157, N'Dread Zeppelin');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (158, N'Battlestar Galactica (Classic)');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (159, N'Aquaman');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (160, N'Christina Aguilera featuring BigElf');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (161, N'Aerosmith & Sierra Leone''s Refugee Allstars');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (162, N'Los Lonely Boys');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (163, N'Corinne Bailey Rae');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (164, N'Dhani Harrison & Jakob Dylan');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (165, N'Jackson Browne');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (166, N'Avril Lavigne');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (167, N'Big & Rich');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (168, N'Youssou N''Dour');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (169, N'Black Eyed Peas');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (170, N'Jack Johnson');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (171, N'Ben Harper');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (172, N'Snow Patrol');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (173, N'Matisyahu');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (174, N'The Postal Service');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (175, N'Jaguares');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (176, N'The Flaming Lips');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (177, N'Jack''s Mannequin & Mick Fleetwood');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (178, N'Regina Spektor');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (179, N'Scorpions');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (180, N'House Of Pain');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (181, N'Xis');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (182, N'Nega Gizza');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (183, N'Gustavo & Andres Veiga & Salazar');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (184, N'Rodox');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (185, N'Charlie Brown Jr.');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (186, N'Pedro Luís E A Parede');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (187, N'Los Hermanos');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (188, N'Mundo Livre S/A');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (189, N'Otto');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (190, N'Instituto');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (191, N'Nação Zumbi');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (192, N'DJ Dolores & Orchestra Santa Massa');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (193, N'Seu Jorge');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (194, N'Sabotage E Instituto');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (195, N'Stereo Maracana');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (196, N'Cake');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (197, N'Aisha Duo');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (198, N'Habib Koité and Bamada');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (199, N'Karsh Kale');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (200, N'The Posies');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (201, N'Luciana Souza/Romero Lubambo');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (202, N'Aaron Goldberg');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (203, N'Nicolaus Esterhazy Sinfonia');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (204, N'Temple of the Dog');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (205, N'Chris Cornell');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (206, N'Alberto Turco & Nova Schola Gregoriana');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (207, N'Richard Marlow & The Choir of Trinity College, Cambridge');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (208, N'English Concert & Trevor Pinnock');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (209, N'Anne-Sophie Mutter, Herbert Von Karajan & Wiener Philharmoniker');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (210, N'Hilary Hahn, Jeffrey Kahane, Los Angeles Chamber Orchestra & Margaret Batjer');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (211, N'Wilhelm Kempff');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (212, N'Yo-Yo Ma');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (213, N'Scholars Baroque Ensemble');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (214, N'Academy of St. Martin in the Fields & Sir Neville Marriner');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (215, N'Academy of St. Martin in the Fields Chamber Ensemble & Sir Neville Marriner');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (216, N'Berliner Philharmoniker, Claudio Abbado & Sabine Meyer');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (217, N'Royal Philharmonic Orchestra & Sir Thomas Beecham');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (218, N'Orchestre Révolutionnaire et Romantique & John Eliot Gardiner');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (219, N'Britten Sinfonia, Ivor Bolton & Lesley Garrett');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (220, N'Chicago Symphony Chorus, Chicago Symphony Orchestra & Sir Georg Solti');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (221, N'Sir Georg Solti & Wiener Philharmoniker');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (222, N'Academy of St. Martin in the Fields, John Birch, Sir Neville Marriner & Sylvia McNair');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (223, N'London Symphony Orchestra & Sir Charles Mackerras');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (224, N'Barry Wordsworth & BBC Concert Orchestra');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (225, N'Herbert Von Karajan, Mirella Freni & Wiener Philharmoniker');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (226, N'Eugene Ormandy');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (227, N'Luciano Pavarotti');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (228, N'Leonard Bernstein & New York Philharmonic');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (229, N'Boston Symphony Orchestra & Seiji Ozawa');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (230, N'Aaron Copland & London Symphony Orchestra');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (231, N'Ton Koopman');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (232, N'Sergei Prokofiev & Yuri Temirkanov');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (233, N'Chicago Symphony Orchestra & Fritz Reiner');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (234, N'Orchestra of The Age of Enlightenment');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (235, N'Emanuel Ax, Eugene Ormandy & Philadelphia Orchestra');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (236, N'James Levine');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (237, N'Berliner Philharmoniker & Hans Rosbaud');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (238, N'Maurizio Pollini');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (239, N'Academy of St. Martin in the Fields, Sir Neville Marriner & William Bennett');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (240, N'Gustav Mahler');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (241, N'Felix Schmidt, London Symphony Orchestra & Rafael Frühbeck de Burgos');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (242, N'Edo de Waart & San Francisco Symphony');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (243, N'Antal Doráti & London Symphony Orchestra');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (244, N'Choir Of Westminster Abbey & Simon Preston');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (245, N'Michael Tilson Thomas & San Francisco Symphony');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (246, N'Chor der Wiener Staatsoper, Herbert Von Karajan & Wiener Philharmoniker');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (247, N'The King''s Singers');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (248, N'Berliner Philharmoniker & Herbert Von Karajan');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (249, N'Sir Georg Solti, Sumi Jo & Wiener Philharmoniker');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (250, N'Christopher O''Riley');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (251, N'Fretwork');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (252, N'Amy Winehouse');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (253, N'Calexico');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (254, N'Otto Klemperer & Philharmonia Orchestra');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (255, N'Yehudi Menuhin');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (256, N'Philharmonia Orchestra & Sir Neville Marriner');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (257, N'Academy of St. Martin in the Fields, Sir Neville Marriner & Thurston Dart');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (258, N'Les Arts Florissants & William Christie');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (259, N'The 12 Cellists of The Berlin Philharmonic');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (260, N'Adrian Leaper & Doreen de Feis');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (261, N'Roger Norrington, London Classical Players');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (262, N'Charles Dutoit & L''Orchestre Symphonique de Montréal');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (263, N'Equale Brass Ensemble, John Eliot Gardiner & Munich Monteverdi Orchestra and Choir');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (264, N'Kent Nagano and Orchestre de l''Opéra de Lyon');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (265, N'Julian Bream');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (266, N'Martin Roscoe');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (267, N'Göteborgs Symfoniker & Neeme Järvi');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (268, N'Itzhak Perlman');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (269, N'Michele Campanella');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (270, N'Gerald Moore');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (271, N'Mela Tenenbaum, Pro Musica Prague & Richard Kapp');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (272, N'Emerson String Quartet');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (273, N'C. Monteverdi, Nigel Rogers - Chiaroscuro; London Baroque; London Cornett & Sackbu');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (274, N'Nash Ensemble');
INSERT INTO `Artist` (`ArtistId`, `Name`) VALUES (275, N'Philip Glass Ensemble');

INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (1, N'For Those About To Rock We Salute You', 1);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (2, N'Balls to the Wall', 2);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (3, N'Restless and Wild', 2);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (4, N'Let There Be Rock', 1);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (5, N'Big Ones', 3);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (6, N'Jagged Little Pill', 4);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (7, N'Facelift', 5);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (8, N'Warner 25 Anos', 6);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (9, N'Plays Metallica By Four Cellos', 7);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (10, N'Audioslave', 8);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (11, N'Out Of Exile', 8);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (12, N'BackBeat Soundtrack', 9);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (13, N'The Best Of Billy Cobham', 10);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (14, N'Alcohol Fueled Brewtality Live! [Disc 1]', 11);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (15, N'Alcohol Fueled Brewtality Live! [Disc 2]', 11);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (16, N'Black Sabbath', 12);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (17, N'Black Sabbath Vol. 4 (Remaster)', 12);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (18, N'Body Count', 13);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (19, N'Chemical Wedding', 14);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (20, N'The Best Of Buddy Guy - The Millenium Collection', 15);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (21, N'Prenda Minha', 16);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (22, N'Sozinho Remix Ao Vivo', 16);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (23, N'Minha Historia', 17);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (24, N'Afrociberdelia', 18);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (25, N'Da Lama Ao Caos', 18);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (26, N'Acústico MTV [Live]', 19);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (27, N'Cidade Negra - Hits', 19);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (28, N'Na Pista', 20);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (29, N'Axé Bahia 2001', 21);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (30, N'BBC Sessions [Disc 1] [Live]', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (31, N'Bongo Fury', 23);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (32, N'Carnaval 2001', 21);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (33, N'Chill: Brazil (Disc 1)', 24);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (34, N'Chill: Brazil (Disc 2)', 6);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (35, N'Garage Inc. (Disc 1)', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (36, N'Greatest Hits II', 51);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (37, N'Greatest Kiss', 52);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (38, N'Heart of the Night', 53);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (39, N'International Superhits', 54);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (40, N'Into The Light', 55);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (41, N'Meus Momentos', 56);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (42, N'Minha História', 57);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (43, N'MK III The Final Concerts [Disc 1]', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (44, N'Physical Graffiti [Disc 1]', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (45, N'Sambas De Enredo 2001', 21);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (46, N'Supernatural', 59);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (47, N'The Best of Ed Motta', 37);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (48, N'The Essential Miles Davis [Disc 1]', 68);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (49, N'The Essential Miles Davis [Disc 2]', 68);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (50, N'The Final Concerts (Disc 2)', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (51, N'Up An'' Atom', 69);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (52, N'Vinícius De Moraes - Sem Limite', 70);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (53, N'Vozes do MPB', 21);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (54, N'Chronicle, Vol. 1', 76);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (55, N'Chronicle, Vol. 2', 76);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (56, N'Cássia Eller - Coleção Sem Limite [Disc 2]', 77);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (57, N'Cássia Eller - Sem Limite [Disc 1]', 77);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (58, N'Come Taste The Band', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (59, N'Deep Purple In Rock', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (60, N'Fireball', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (61, N'Knocking at Your Back Door: The Best Of Deep Purple in the 80''s', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (62, N'Machine Head', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (63, N'Purpendicular', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (64, N'Slaves And Masters', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (65, N'Stormbringer', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (66, N'The Battle Rages On', 58);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (67, N'Vault: Def Leppard''s Greatest Hits', 78);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (68, N'Outbreak', 79);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (69, N'Djavan Ao Vivo - Vol. 02', 80);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (70, N'Djavan Ao Vivo - Vol. 1', 80);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (71, N'Elis Regina-Minha História', 41);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (72, N'The Cream Of Clapton', 81);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (73, N'Unplugged', 81);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (74, N'Album Of The Year', 82);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (75, N'Angel Dust', 82);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (76, N'King For A Day Fool For A Lifetime', 82);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (77, N'The Real Thing', 82);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (78, N'Deixa Entrar', 83);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (79, N'In Your Honor [Disc 1]', 84);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (80, N'In Your Honor [Disc 2]', 84);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (81, N'One By One', 84);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (82, N'The Colour And The Shape', 84);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (83, N'My Way: The Best Of Frank Sinatra [Disc 1]', 85);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (84, N'Roda De Funk', 86);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (85, N'As Canções de Eu Tu Eles', 27);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (86, N'Quanta Gente Veio Ver (Live)', 27);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (87, N'Quanta Gente Veio ver--Bônus De Carnaval', 27);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (88, N'Faceless', 87);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (89, N'American Idiot', 54);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (90, N'Appetite for Destruction', 88);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (91, N'Use Your Illusion I', 88);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (92, N'Use Your Illusion II', 88);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (93, N'Blue Moods', 89);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (94, N'A Matter of Life and Death', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (95, N'A Real Dead One', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (96, N'A Real Live One', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (97, N'Brave New World', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (98, N'Dance Of Death', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (99, N'Fear Of The Dark', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (100, N'Iron Maiden', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (101, N'Killers', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (102, N'Live After Death', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (103, N'Live At Donington 1992 (Disc 1)', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (104, N'Live At Donington 1992 (Disc 2)', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (105, N'No Prayer For The Dying', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (106, N'Piece Of Mind', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (107, N'Powerslave', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (108, N'Rock In Rio [CD1]', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (109, N'Rock In Rio [CD2]', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (110, N'Seventh Son of a Seventh Son', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (111, N'Somewhere in Time', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (112, N'The Number of The Beast', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (113, N'The X Factor', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (114, N'Virtual XI', 90);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (115, N'Sex Machine', 91);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (116, N'Emergency On Planet Earth', 92);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (117, N'Synkronized', 92);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (118, N'The Return Of The Space Cowboy', 92);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (119, N'Get Born', 93);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (120, N'Are You Experienced?', 94);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (121, N'Surfing with the Alien (Remastered)', 95);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (122, N'Jorge Ben Jor 25 Anos', 46);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (123, N'Jota Quest-1995', 96);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (124, N'Cafezinho', 97);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (125, N'Living After Midnight', 98);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (126, N'Unplugged [Live]', 52);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (127, N'BBC Sessions [Disc 2] [Live]', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (128, N'Coda', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (129, N'Houses Of The Holy', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (130, N'In Through The Out Door', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (131, N'IV', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (132, N'Led Zeppelin I', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (133, N'Led Zeppelin II', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (134, N'Led Zeppelin III', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (135, N'Physical Graffiti [Disc 2]', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (136, N'Presence', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (137, N'The Song Remains The Same (Disc 1)', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (138, N'The Song Remains The Same (Disc 2)', 22);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (139, N'A TempestadeTempestade Ou O Livro Dos Dias', 99);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (140, N'Mais Do Mesmo', 99);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (141, N'Greatest Hits', 100);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (142, N'Lulu Santos - RCA 100 Anos De Música - Álbum 01', 101);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (143, N'Lulu Santos - RCA 100 Anos De Música - Álbum 02', 101);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (144, N'Misplaced Childhood', 102);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (145, N'Barulhinho Bom', 103);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (146, N'Seek And Shall Find: More Of The Best (1963-1981)', 104);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (147, N'The Best Of Men At Work', 105);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (148, N'Black Album', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (149, N'Garage Inc. (Disc 2)', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (150, N'Kill ''Em All', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (151, N'Load', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (152, N'Master Of Puppets', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (153, N'ReLoad', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (154, N'Ride The Lightning', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (155, N'St. Anger', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (156, N'...And Justice For All', 50);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (157, N'Miles Ahead', 68);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (158, N'Milton Nascimento Ao Vivo', 42);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (159, N'Minas', 42);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (160, N'Ace Of Spades', 106);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (161, N'Demorou...', 108);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (162, N'Motley Crue Greatest Hits', 109);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (163, N'From The Muddy Banks Of The Wishkah [Live]', 110);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (164, N'Nevermind', 110);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (165, N'Compositores', 111);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (166, N'Olodum', 112);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (167, N'Acústico MTV', 113);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (168, N'Arquivo II', 113);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (169, N'Arquivo Os Paralamas Do Sucesso', 113);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (170, N'Bark at the Moon (Remastered)', 114);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (171, N'Blizzard of Ozz', 114);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (172, N'Diary of a Madman (Remastered)', 114);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (173, N'No More Tears (Remastered)', 114);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (174, N'Tribute', 114);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (175, N'Walking Into Clarksdale', 115);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (176, N'Original Soundtracks 1', 116);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (177, N'The Beast Live', 117);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (178, N'Live On Two Legs [Live]', 118);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (179, N'Pearl Jam', 118);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (180, N'Riot Act', 118);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (181, N'Ten', 118);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (182, N'Vs.', 118);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (183, N'Dark Side Of The Moon', 120);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (184, N'Os Cães Ladram Mas A Caravana Não Pára', 121);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (185, N'Greatest Hits I', 51);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (186, N'News Of The World', 51);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (187, N'Out Of Time', 122);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (188, N'Green', 124);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (189, N'New Adventures In Hi-Fi', 124);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (190, N'The Best Of R.E.M.: The IRS Years', 124);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (191, N'Cesta Básica', 125);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (192, N'Raul Seixas', 126);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (193, N'Blood Sugar Sex Magik', 127);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (194, N'By The Way', 127);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (195, N'Californication', 127);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (196, N'Retrospective I (1974-1980)', 128);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (197, N'Santana - As Years Go By', 59);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (198, N'Santana Live', 59);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (199, N'Maquinarama', 130);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (200, N'O Samba Poconé', 130);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (201, N'Judas 0: B-Sides and Rarities', 131);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (202, N'Rotten Apples: Greatest Hits', 131);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (203, N'A-Sides', 132);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (204, N'Morning Dance', 53);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (205, N'In Step', 133);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (206, N'Core', 134);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (207, N'Mezmerize', 135);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (208, N'[1997] Black Light Syndrome', 136);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (209, N'Live [Disc 1]', 137);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (210, N'Live [Disc 2]', 137);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (211, N'The Singles', 138);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (212, N'Beyond Good And Evil', 139);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (213, N'Pure Cult: The Best Of The Cult (For Rockers, Ravers, Lovers & Sinners) [UK]', 139);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (214, N'The Doors', 140);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (215, N'The Police Greatest Hits', 141);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (216, N'Hot Rocks, 1964-1971 (Disc 1)', 142);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (217, N'No Security', 142);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (218, N'Voodoo Lounge', 142);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (219, N'Tangents', 143);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (220, N'Transmission', 143);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (221, N'My Generation - The Very Best Of The Who', 144);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (222, N'Serie Sem Limite (Disc 1)', 145);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (223, N'Serie Sem Limite (Disc 2)', 145);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (224, N'Acústico', 146);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (225, N'Volume Dois', 146);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (226, N'Battlestar Galactica: The Story So Far', 147);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (227, N'Battlestar Galactica, Season 3', 147);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (228, N'Heroes, Season 1', 148);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (229, N'Lost, Season 3', 149);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (230, N'Lost, Season 1', 149);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (231, N'Lost, Season 2', 149);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (232, N'Achtung Baby', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (233, N'All That You Can''t Leave Behind', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (234, N'B-Sides 1980-1990', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (235, N'How To Dismantle An Atomic Bomb', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (236, N'Pop', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (237, N'Rattle And Hum', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (238, N'The Best Of 1980-1990', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (239, N'War', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (240, N'Zooropa', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (241, N'UB40 The Best Of - Volume Two [UK]', 151);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (242, N'Diver Down', 152);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (243, N'The Best Of Van Halen, Vol. I', 152);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (244, N'Van Halen', 152);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (245, N'Van Halen III', 152);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (246, N'Contraband', 153);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (247, N'Vinicius De Moraes', 72);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (248, N'Ao Vivo [IMPORT]', 155);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (249, N'The Office, Season 1', 156);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (250, N'The Office, Season 2', 156);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (251, N'The Office, Season 3', 156);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (252, N'Un-Led-Ed', 157);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (253, N'Battlestar Galactica (Classic), Season 1', 158);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (254, N'Aquaman', 159);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (255, N'Instant Karma: The Amnesty International Campaign to Save Darfur', 150);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (256, N'Speak of the Devil', 114);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (257, N'20th Century Masters - The Millennium Collection: The Best of Scorpions', 179);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (258, N'House of Pain', 180);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (259, N'Radio Brasil (O Som da Jovem Vanguarda) - Seleccao de Henrique Amaro', 36);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (260, N'Cake: B-Sides and Rarities', 196);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (261, N'LOST, Season 4', 149);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (262, N'Quiet Songs', 197);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (263, N'Muso Ko', 198);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (264, N'Realize', 199);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (265, N'Every Kind of Light', 200);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (266, N'Duos II', 201);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (267, N'Worlds', 202);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (268, N'The Best of Beethoven', 203);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (269, N'Temple of the Dog', 204);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (270, N'Carry On', 205);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (271, N'Revelations', 8);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (272, N'Adorate Deum: Gregorian Chant from the Proper of the Mass', 206);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (273, N'Allegri: Miserere', 207);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (274, N'Pachelbel: Canon & Gigue', 208);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (275, N'Vivaldi: The Four Seasons', 209);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (276, N'Bach: Violin Concertos', 210);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (277, N'Bach: Goldberg Variations', 211);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (278, N'Bach: The Cello Suites', 212);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (279, N'Handel: The Messiah (Highlights)', 213);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (280, N'The World of Classical Favourites', 214);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (281, N'Sir Neville Marriner: A Celebration', 215);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (282, N'Mozart: Wind Concertos', 216);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (283, N'Haydn: Symphonies 99 - 104', 217);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (284, N'Beethoven: Symhonies Nos. 5 & 6', 218);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (285, N'A Soprano Inspired', 219);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (286, N'Great Opera Choruses', 220);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (287, N'Wagner: Favourite Overtures', 221);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (288, N'Fauré: Requiem, Ravel: Pavane & Others', 222);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (289, N'Tchaikovsky: The Nutcracker', 223);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (290, N'The Last Night of the Proms', 224);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (291, N'Puccini: Madama Butterfly - Highlights', 225);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (292, N'Holst: The Planets, Op. 32 & Vaughan Williams: Fantasies', 226);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (293, N'Pavarotti''s Opera Made Easy', 227);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (294, N'Great Performances - Barber''s Adagio and Other Romantic Favorites for Strings', 228);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (295, N'Carmina Burana', 229);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (296, N'A Copland Celebration, Vol. I', 230);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (297, N'Bach: Toccata & Fugue in D Minor', 231);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (298, N'Prokofiev: Symphony No.1', 232);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (299, N'Scheherazade', 233);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (300, N'Bach: The Brandenburg Concertos', 234);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (301, N'Chopin: Piano Concertos Nos. 1 & 2', 235);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (302, N'Mascagni: Cavalleria Rusticana', 236);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (303, N'Sibelius: Finlandia', 237);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (304, N'Beethoven Piano Sonatas: Moonlight & Pastorale', 238);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (305, N'Great Recordings of the Century - Mahler: Das Lied von der Erde', 240);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (306, N'Elgar: Cello Concerto & Vaughan Williams: Fantasias', 241);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (307, N'Adams, John: The Chairman Dances', 242);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (308, N'Tchaikovsky: 1812 Festival Overture, Op.49, Capriccio Italien & Beethoven: Wellington''s Victory', 243);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (309, N'Palestrina: Missa Papae Marcelli & Allegri: Miserere', 244);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (310, N'Prokofiev: Romeo & Juliet', 245);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (311, N'Strauss: Waltzes', 226);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (312, N'Berlioz: Symphonie Fantastique', 245);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (313, N'Bizet: Carmen Highlights', 246);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (314, N'English Renaissance', 247);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (315, N'Handel: Music for the Royal Fireworks (Original Version 1749)', 208);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (316, N'Grieg: Peer Gynt Suites & Sibelius: Pelléas et Mélisande', 248);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (317, N'Mozart Gala: Famous Arias', 249);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (318, N'SCRIABIN: Vers la flamme', 250);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (319, N'Armada: Music from the Courts of England and Spain', 251);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (320, N'Mozart: Symphonies Nos. 40 & 41', 248);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (321, N'Back to Black', 252);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (322, N'Frank', 252);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (323, N'Carried to Dust (Bonus Track Version)', 253);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (324, N'Beethoven: Symphony No. 6 ''Pastoral'' Etc.', 254);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (325, N'Bartok: Violin & Viola Concertos', 255);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (326, N'Mendelssohn: A Midsummer Night''s Dream', 256);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (327, N'Bach: Orchestral Suites Nos. 1 - 4', 257);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (328, N'Charpentier: Divertissements, Airs & Concerts', 258);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (329, N'South American Getaway', 259);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (330, N'Górecki: Symphony No. 3', 260);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (331, N'Purcell: The Fairy Queen', 261);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (332, N'The Ultimate Relexation Album', 262);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (333, N'Purcell: Music for the Queen Mary', 263);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (334, N'Weill: The Seven Deadly Sins', 264);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (335, N'J.S. Bach: Chaconne, Suite in E Minor, Partita in E Major & Prelude, Fugue and Allegro', 265);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (336, N'Prokofiev: Symphony No.5 & Stravinksy: Le Sacre Du Printemps', 248);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (337, N'Szymanowski: Piano Works, Vol. 1', 266);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (338, N'Nielsen: The Six Symphonies', 267);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (339, N'Great Recordings of the Century: Paganini''s 24 Caprices', 268);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (340, N'Liszt - 12 Études D''Execution Transcendante', 269);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (341, N'Great Recordings of the Century - Shubert: Schwanengesang, 4 Lieder', 270);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (342, N'Locatelli: Concertos for Violin, Strings and Continuo, Vol. 3', 271);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (343, N'Respighi:Pines of Rome', 226);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (344, N'Schubert: The Late String Quartets & String Quintet (3 CD''s)', 272);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (345, N'Monteverdi: L''Orfeo', 273);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (346, N'Mozart: Chamber Music', 274);
INSERT INTO `Album` (`AlbumId`, `Title`, `ArtistId`) VALUES (347, N'Koyaanisqatsi (Soundtrack from the Motion Picture)', 275);
