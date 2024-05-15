create table autempsdonne.activities
(
    id   smallint(6) unsigned not null
        primary key,
    name varchar(20)          null
);

create table autempsdonne.articles
(
    id        int auto_increment
        primary key,
    title     varchar(200) null,
    date      varchar(20)  null,
    content   text         null,
    last_edit varchar(20)  null
);

create table autempsdonne.articles_files
(
    id            int auto_increment
        primary key,
    article_id_fk int          not null,
    filename      varchar(255) not null,
    constraint articles_id_fk
        foreign key (article_id_fk) references autempsdonne.articles (id)
            on update cascade on delete cascade
);

create table autempsdonne.invoices
(
    id       int auto_increment
        primary key,
    name     varchar(60)  default 'Inconnu' null,
    lastname varchar(100) default 'Inconnu' null,
    email    varchar(255)                   null,
    amount   int          default 0         null,
    address  varchar(255)                   null
);

create table autempsdonne.language_list
(
    language_acr  char(5)      not null
        primary key,
    language_name varchar(255) not null
);

create table autempsdonne.login_logs
(
    id          int auto_increment
        primary key,
    login_value varchar(255) null,
    success     tinyint(1)          null,
    login_date  datetime default current_timestamp  null
);

create table autempsdonne.stock_evolution
(
    amount int  null,
    date   date null
);

create table autempsdonne.work_places
(
    id         int auto_increment
        primary key,
    address    varchar(255)  null,
    place_type varchar(30)   null,
    place_name varchar(50)   null,
    phone      char(10)      null,
    capacity   int default 0 null
);

create table autempsdonne.stock
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
        foreign key (idEntrepot_fk) references autempsdonne.work_places (id)
            on update cascade on delete cascade
);

create table autempsdonne.trucks
(
    id            int auto_increment
        primary key,
    numberplate   varchar(9) not null,
    parking_place int        not null,
    constraint trucks_fk
        foreign key (parking_place) references autempsdonne.work_places (id)
);

create table autempsdonne.users
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
    forget_code   int                                                            null,
    constraint users_pk
        unique (username),
    constraint users_ibfk_1
        foreign key (work_place) references autempsdonne.work_places (id)
            on update cascade on delete cascade
);

create table autempsdonne.beneficiary_applications
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
        foreign key (user_id_fk) references autempsdonne.users (id)
            on update cascade on delete cascade
);

create table autempsdonne.collects
(
    id           int auto_increment
        primary key,
    start_date   datetime     not null,
    end_date     datetime     null,
    driver_id_fk int          not null,
    traject_file varchar(255) null,
    status int not null,
    constraint fk_driver_id
        foreign key (driver_id_fk) references autempsdonne.users (id)
            on update cascade on delete cascade
);

create table autempsdonne.driving_licenses
(
    user_id_fk    int                  not null,
    car_license   tinyint(1) default 0 null,
    truck_license tinyint(1) default 0 null,
    bike_license  tinyint(1) default 0 null,
    constraint driving_licenses_ibfk_1
        foreign key (user_id_fk) references autempsdonne.users (id)
            on update cascade on delete cascade
);

create table autempsdonne.elderly_visit_log
(
    id          int auto_increment
        primary key,
    idVolunteer int                    not null,
    idElderly   int                    not null,
    date        date default curdate() not null,
    constraint elderly_visit_log_users_id_fk
        foreign key (idVolunteer) references autempsdonne.users (id)
            on update cascade on delete cascade,
    constraint elderly_visit_log_users_id_fk_2
        foreign key (idElderly) references autempsdonne.users (id)
            on update cascade on delete cascade
);

create table autempsdonne.events
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
        foreign key (responsable) references autempsdonne.users (id)
            on update cascade on delete set null,
    constraint fk_events_type
        foreign key (type_event_id_fk) references autempsdonne.activities (id)
            on update cascade on delete set null
);

create table autempsdonne.event_contributors
(
    id          int unsigned auto_increment
        primary key,
    event_id_fk int                               not null,
    user_id_fk  int                               not null,
    role        varchar(75) default 'contributor' null,
    constraint fk_contributor_event_id
        foreign key (event_id_fk) references autempsdonne.events (id)
            on update cascade on delete cascade,
    constraint fk_contributor_user_id
        foreign key (user_id_fk) references autempsdonne.users (id)
            on update cascade on delete cascade
);

create table autempsdonne.event_trajects
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
        foreign key (event_id_fk) references autempsdonne.events (id)
            on update cascade on delete cascade
);

create index fk_events_type_idx
    on autempsdonne.events (type_event_id_fk);

create table autempsdonne.formations
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
        foreign key (work_place_id_fk) references autempsdonne.work_places (id),
    constraint formations_ibfk_2
        foreign key (user_id_fk) references autempsdonne.users (id),
    constraint formations_ivfk_3
        foreign key (type) references autempsdonne.activities (id)
            on update cascade on delete set null
);

create index formations_ivfk_3_idx
    on autempsdonne.formations (type);

create index user_id_fk
    on autempsdonne.formations (user_id_fk);

create index work_place_id_fk
    on autempsdonne.formations (work_place_id_fk);

create table if not exists plannings
(
    id                 int auto_increment
        primary key,
    user_id_fk         int              not null,
    datetime_start     datetime         null,
    datetime_end       datetime         null,
    description        varchar(255)     null,
    disponibility_type tinyint unsigned null,
    event_id_fk        int              null,
    constraint event_id_fk_constraint
        foreign key (event_id_fk) references events (id)
            on update cascade on delete cascade,
    constraint user_id_fk_constraint
        foreign key (user_id_fk) references users (id)
);

create index event_id_fk_constraint_idx
    on autempsdonne.plannings (event_id_fk);

create table autempsdonne.registered_formation
(
    user_id_fk      int         not null,
    formation_id_fk int         not null,
    status          varchar(20) null,
    date            datetime    null,
    constraint registered_formation_ibfk_1
        foreign key (user_id_fk) references autempsdonne.users (id),
    constraint registered_formation_ibfk_2
        foreign key (formation_id_fk) references autempsdonne.formations (id)
);

create index formation_id_fk
    on autempsdonne.registered_formation (formation_id_fk);

create index user_id_fk
    on autempsdonne.registered_formation (user_id_fk);

create table autempsdonne.tickets
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
        foreign key (author) references autempsdonne.users (id)
);

create table if not exists autempsdonne.tickets_chat
(
    id              int auto_increment
        primary key,
    message_content varchar(255)                         null,
    ticket_id_fk    int                                  not null,
    author_id_fk    int                                  not null,
    type            smallint default 0                   null,
    date            datetime default current_timestamp() null,
    constraint tickets_chat_ibfk_1
        foreign key (ticket_id_fk) references tickets (id)
            on update cascade on delete cascade,
    constraint tickets_chat_ibfk_2
        foreign key (author_id_fk) references users (id)
            on update cascade on delete cascade
);

create table autempsdonne.user_formations
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
        foreign key (user_id_fk) references autempsdonne.users (id)
            on update cascade on delete cascade
);

create table autempsdonne.volunteer_applications
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
        foreign key (user_id_fk) references autempsdonne.users (id)
            on update cascade on delete cascade
);

create table autempsdonne.volunteer_chat
(
    id              int auto_increment
        primary key,
    user_id_fk      int                                  not null,
    message_content varchar(255)                         null,
    message_type    tinyint                              null,
    message_date    datetime default current_timestamp() null,
    constraint volunteer_chat_ibfk_1
        foreign key (user_id_fk) references autempsdonne.users (id)
);

create index user_id_fk
    on autempsdonne.volunteer_chat (user_id_fk);

create table if not exists autempsdonne.event_stocks
(
    id                  int auto_increment
        primary key,
    event_id_fk         int                           null,
    element_stock_id_fk int                           not null,
    amount              int         default 0         null,
    status              varchar(10) default 'pending' null,
    constraint element_stock_id_fk_1
        foreign key (element_stock_id_fk) references stock (id),
    constraint event_id_fk_1
        foreign key (event_id_fk) references events (id)
            on update cascade on delete set null
);

create table if not exists autempsdonne.partner
(
    id          int auto_increment
        primary key,
    description varchar(255)   null,
    address     varchar(255)   null,
    zip_code    int default 0  null,
    city        varchar(255)   null,
    lng         decimal(10, 8) null,
    lat         decimal(11, 8) null,
    status      int            null
);

create table if not exists autempsdonne.collect_trajects
(
    id         int auto_increment
        primary key,
    collect_id int not null,
    partner_id int not null,
    constraint fk_collect_id
        foreign key (collect_id) references collects (id)
            on update cascade on delete cascade,
    constraint fk_partner_id
        foreign key (partner_id) references partner (id)
            on update cascade on delete cascade
);

create table if not exists autempsdonne.event_beneficiaries
(
    id                int unsigned auto_increment
        primary key,
    event_id_fk       int null,
    beneficiary_id_fk int null,
    constraint event_beneficiaries_fk_beneficiary_id_fk
        foreign key (beneficiary_id_fk) references users (id)
            on update cascade on delete set null,
    constraint event_beneficiaries_fk_event_id
        foreign key (event_id_fk) references events (id)
            on update cascade on delete set null
);

create table if not exists autempsdonne.webchat
(
    id               int unsigned auto_increment
        primary key,
    user_id_fk       int          null,
    message          varchar(255) null,
    message_type     tinyint      null,
    status           tinyint      null,
    message_datetime datetime     null,
    constraint webchat_fk_user_id
        foreign key (user_id_fk) references users (id)
            on update cascade on delete set null
);