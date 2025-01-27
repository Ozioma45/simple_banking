--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: oziomajohn
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(200) NOT NULL,
    email character varying(200) NOT NULL,
    password character varying(200) NOT NULL,
    reset_token text,
    reset_token_expires bigint
);


ALTER TABLE public.users OWNER TO oziomajohn;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: oziomajohn
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO oziomajohn;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: oziomajohn
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: oziomajohn
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: oziomajohn
--

COPY public.users (id, name, email, password, reset_token, reset_token_expires) FROM stdin;
2	David	dav@gmail.com	$2b$10$xsJoUM8bozi4W08VTkXd3eh2xqSFm.iw/zjrlrMVvyIjFyfCKaUIW	\N	\N
3	ozioma	ozi@gmail.com	$2b$10$f.J6bNyAewFZyY7xRwVf1.cNkM3ft7ljC9vO4U5cT0v19BgliJOeW	\N	\N
4	test main	test1@gmail.com	$2b$10$ZMaPs7eetztcgpLLjuZ1VuEFyvs09RV3BrlL2mCj9J1/Yy0Hqmyjm	\N	\N
5	test2	test2@gmail.com	$2b$10$jmKm1qHehzckcPyP0M6SRuUxcIrwYcgQOLw1L/OQd/rlTrGIyW/8q	\N	\N
1	Ozioma	oziomaegole@gmail.com	password	627cd081c5012f03877f7dc08873c3ca0823e22b	1737912292101
6	ozioma	oziomajohn53@gmail.com	$2b$10$CI7xxf5E2sP/pOolH9WTIOHFmfm84zCwmvBD22h6aMM0NCHyd1SFS	\N	\N
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: oziomajohn
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: oziomajohn
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: oziomajohn
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

