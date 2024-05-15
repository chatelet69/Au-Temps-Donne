create table autempsdonne_dev.activities
(
    id   smallint(6) unsigned not null
        primary key,
    name varchar(20)          null
);

create table autempsdonne_dev.articles
(
    id        int auto_increment
        primary key,
    title     varchar(200) null,
    date      varchar(20)  null,
    content   text         null,
    last_edit varchar(20)  null
);

create table autempsdonne_dev.articles_files
(
    id            int auto_increment
        primary key,
    article_id_fk int          not null,
    filename      varchar(255) not null,
    constraint articles_id_fk
        foreign key (article_id_fk) references autempsdonne_dev.articles (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.invoices
(
    id       int auto_increment
        primary key,
    name     varchar(60)  default 'Inconnu' null,
    lastname varchar(100) default 'Inconnu' null,
    email    varchar(255)                   null,
    amount   int          default 0         null,
    address  varchar(255)                   null
);

create table autempsdonne_dev.language_list
(
    language_acr  char(5)      not null
        primary key,
    language_name varchar(255) not null
);

create table autempsdonne_dev.login_logs
(
    id          int auto_increment
        primary key,
    login_value varchar(255) null,
    success     tinyint(1) null,
    login_date  datetime default current_timestamp null
);

create table autempsdonne_dev.stock_evolution
(
    amount int  null,
    date   date null
);

create table autempsdonne_dev.work_places
(
    id         int auto_increment
        primary key,
    address    varchar(255)  null,
    place_type varchar(30)   null,
    place_name varchar(50)   null,
    phone      char(10)      null,
    capacity   int default 0 null
);

create table autempsdonne_dev.stock
(
    id            int auto_increment
        primary key,
    barcode       varchar(255)           not null,
    title         varchar(255)           not null,
    idEntrepot_fk int                    null,
    location      varchar(255)           null,
    amount        int                    null,
    type          varchar(255)           not null,
    category      varchar(255)           null,
    allergy       varchar(255)           null,
    status        int                    null,
    insert_date   date default curdate() null,
    expiry_date   date                   null,
    picture       varchar(255)           null,
    constraint fk__idEntrepot
        foreign key (idEntrepot_fk) references autempsdonne_dev.work_places (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.trucks
(
    id            int auto_increment
        primary key,
    numberplate   varchar(9) not null,
    parking_place int        not null,
    constraint trucks_fk
        foreign key (parking_place) references autempsdonne_dev.work_places (id)
);

create table autempsdonne_dev.users
(
    id            int auto_increment
        primary key,
    username      varchar(45)                                                    not null,
    email         varchar(255)                                                   null,
    password      varchar(255)                                                   not null,
    `rank`        int        default 1                                           null,
    name          varchar(60)                                                    null,
    lastname      varchar(70)                                                    null,
    birthday      varchar(20)                                                    null,
    address       varchar(255)                                                   null,
    gender        tinyint                                                        null,
    phone         varchar(13)                                                    null,
    situation     varchar(100)                                                   null,
    pfp           varchar(255)                                                   null,
    newsletter    tinyint    default 0                                           null,
    notifications tinyint    default 0                                           null,
    darkmode      int        default 0                                           null,
    work_place    int                                                            null,
    pass_salt     int        default floor(rand() * (99999 - 10000 + 1) + 10000) null,
    language      varchar(5) default 'FR'                                        not null,
    jwt           text                                                           null,
    constraint users_pk
        unique (username),
    constraint users_ibfk_1
        foreign key (work_place) references autempsdonne_dev.work_places (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.beneficiary_applications
(
    id                 int auto_increment
        primary key,
    user_id_fk         int                    not null,
    situation_proof    varchar(255)           null,
    debts_proof        varchar(255)           null,
    home_proof         varchar(255)           null,
    payslip            varchar(255)           null,
    reason_application varchar(255)           null,
    date               date default curdate() null,
    status             int  default 0         null,
    constraint beneficiary_applications_ibfk_1
        foreign key (user_id_fk) references autempsdonne_dev.users (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.collects
(
    id           int auto_increment
        primary key,
    start_date   datetime     not null,
    end_date     datetime     null,
    driver_id_fk int          not null,
    traject_file varchar(255) null,
    constraint fk_driver_id
        foreign key (driver_id_fk) references autempsdonne_dev.users (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.driving_licenses
(
    user_id_fk    int                  not null,
    car_license   tinyint(1) default 0 null,
    truck_license tinyint(1) default 0 null,
    bike_license  tinyint(1) default 0 null,
    constraint driving_licenses_ibfk_1
        foreign key (user_id_fk) references autempsdonne_dev.users (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.elderly_visit_log
(
    id          int auto_increment
        primary key,
    idVolunteer int                    not null,
    idElderly   int                    not null,
    date        date default curdate() not null,
    constraint elderly_visit_log_users_id_fk
        foreign key (idVolunteer) references autempsdonne_dev.users (id)
            on update cascade on delete cascade,
    constraint elderly_visit_log_users_id_fk_2
        foreign key (idElderly) references autempsdonne_dev.users (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.events
(
    id               int auto_increment
        primary key,
    type_event_id_fk smallint unsigned                   null,
    title            varchar(70)  default 'Pas de titre' null,
    start_datetime   datetime                            null,
    end_datetime     datetime                            null,
    responsable      int          default 0              null,
    description      varchar(255)                        null,
    place            varchar(255) default 'Pas de lieu'  null,
    constraint fk_event_responsable
        foreign key (responsable) references autempsdonne_dev.users (id)
            on update cascade on delete set null,
    constraint fk_events_type
        foreign key (type_event_id_fk) references autempsdonne_dev.activities (id)
            on update cascade on delete set null
);

create table autempsdonne_dev.event_contributors
(
    id          int unsigned auto_increment
        primary key,
    event_id_fk int                               not null,
    user_id_fk  int                               not null,
    role        varchar(75) default 'contributor' null,
    constraint fk_contributor_event_id
        foreign key (event_id_fk) references autempsdonne_dev.events (id)
            on update cascade on delete cascade,
    constraint fk_contributor_user_id
        foreign key (user_id_fk) references autempsdonne_dev.users (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.event_trajects
(
    id            int auto_increment
        primary key,
    event_id_fk   int            not null,
    address       varchar(255)   null,
    city          varchar(255)   null,
    zip_code      varchar(8)     null,
    lng           decimal(10, 8) null,
    lat           decimal(11, 8) null,
    constraint fk_event_id
        foreign key (event_id_fk) references autempsdonne_dev.events (id)
            on update cascade on delete cascade
);

create index fk_events_type_idx
    on autempsdonne_dev.events (type_event_id_fk);

create table autempsdonne_dev.formations
(
    id               int auto_increment
        primary key,
    work_place_id_fk int                                not null,
    title            varchar(70) default 'Pas de titre' null,
    datetime_start   datetime                           null,
    datetime_end     datetime                           null,
    nb_places        int                                null,
    user_id_fk       int                                not null,
    type             smallint unsigned                  null,
    status           varchar(20)                        null,
    description      varchar(255)                       null,
    constraint formations_ibfk_1
        foreign key (work_place_id_fk) references autempsdonne_dev.work_places (id),
    constraint formations_ibfk_2
        foreign key (user_id_fk) references autempsdonne_dev.users (id),
    constraint formations_ivfk_3
        foreign key (type) references autempsdonne_dev.activities (id)
            on update cascade on delete set null
);

create index formations_ivfk_3_idx
    on autempsdonne_dev.formations (type);

create index user_id_fk
    on autempsdonne_dev.formations (user_id_fk);

create index work_place_id_fk
    on autempsdonne_dev.formations (work_place_id_fk);

create table autempsdonne_dev.plannings
(
    id                 int auto_increment
        primary key,
    user_id_fk         int               not null,
    datetime_start     datetime          null,
    datetime_end       datetime          null,
    description        varchar(255)      null,
    disponibility_type tinyint unsigned  null,
    activity_type_fk   smallint unsigned null,
    constraint activity_type_fk_constraint
        foreign key (activity_type_fk) references autempsdonne_dev.activities (id)
            on update cascade on delete set null,
    constraint user_id_fk_constraint
        foreign key (user_id_fk) references autempsdonne_dev.users (id)
);

create index activity_type_fk_constraint_idx
    on autempsdonne_dev.plannings (activity_type_fk);

create table autempsdonne_dev.registered_formation
(
    user_id_fk      int         not null,
    formation_id_fk int         not null,
    status          varchar(20) null,
    date            datetime    null,
    constraint registered_formation_ibfk_1
        foreign key (user_id_fk) references autempsdonne_dev.users (id),
    constraint registered_formation_ibfk_2
        foreign key (formation_id_fk) references autempsdonne_dev.formations (id)
);

create index formation_id_fk
    on autempsdonne_dev.registered_formation (formation_id_fk);

create index user_id_fk
    on autempsdonne_dev.registered_formation (user_id_fk);

create table autempsdonne_dev.tickets
(
    id            int auto_increment
        primary key,
    title         varchar(150)              not null,
    description   varchar(255)              null,
    ticket_status tinyint default 1         null,
    difficulty    int     default 0         null,
    author        int                       null,
    category      varchar(255)              null,
    date          date    default curdate() null,
    constraint ticket_author_id
        foreign key (author) references autempsdonne_dev.users (id)
);

create table autempsdonne_dev.tickets_chat
(
    id              int auto_increment
        primary key,
    message_content varchar(255)  null,
    ticket_id_fk    int           not null,
    author_id_fk    int           not null,
    type            int default 0 null,
    constraint tickets_chat_ibfk_1
        foreign key (ticket_id_fk) references autempsdonne_dev.tickets (id)
            on update cascade on delete cascade,
    constraint tickets_chat_ibfk_2
        foreign key (author_id_fk) references autempsdonne_dev.users (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.user_formations
(
    id           int auto_increment
        primary key,
    user_id_fk   int                  not null,
    collect      tinyint(1) default 0 null,
    old_people   tinyint(1) default 0 null,
    marauding    tinyint(1) default 0 null,
    study        tinyint(1) default 0 null,
    recruitement tinyint(1) default 0 null,
    stock        int                  null,
    constraint user_formations_ibfk_1
        foreign key (user_id_fk) references autempsdonne_dev.users (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.volunteer_applications
(
    id                 int auto_increment
        primary key,
    user_id_fk         int                    not null,
    cv                 varchar(255)           not null,
    motivation_letter  varchar(255)           null,
    remarks            text                   null,
    knowledges         varchar(255)           null,
    disponibility_type int                    null,
    disponibility_days int  default 0         null,
    status             int  default 0         null,
    date               date default curdate() null,
    criminal_record    varchar(255)           null,
    constraint volunteer_applications_ibfk_1
        foreign key (user_id_fk) references autempsdonne_dev.users (id)
            on update cascade on delete cascade
);

create table autempsdonne_dev.volunteer_chat
(
    id              int auto_increment
        primary key,
    user_id_fk      int                                  not null,
    message_content varchar(255)                         null,
    message_type    tinyint                              null,
    message_date    datetime default current_timestamp() null,
    constraint volunteer_chat_ibfk_1
        foreign key (user_id_fk) references autempsdonne_dev.users (id)
);

create index user_id_fk
    on autempsdonne_dev.volunteer_chat (user_id_fk);

create table autempsdonne.event_stocks
(
    id int auto_increment primary key,
    event_id_fk int not null,
    element_stock_id_fk int not null,
    amount int default 0,
    constraint event_id_fk_1 foreign key (event_id_fk) references autempsdonne.events (id),
    constraint element_stock_id_fk_1 foreign key (element_stock_id_fk) references autempsdonne.stock (id)
);