const credentials = require("../credentials.json");
module.exports = {
  NODE_SERVER_PORT: 3005,
  MONGO_DB_URL: credentials.database,
  HOST: credentials.host,
  ALLOWED_ORIGINS: [
    "http://localhost:3005",
  ],
  ACCESSTOKENSECRETKEY:"hkl_credentials",
  CSVFILESIZE: 1048576,
  CSVFILEFORMATS: ["text/csv"],
  COLLECTIONS: {
    USER_COLLECTION: "users",
    QUESTION_COLLECTION_NAME:'Question',
    CATEGORY_COLLECTION_NAME:'Category',
  },
  AWS_CREDENTIALS:{
    ACCESS_KEY_ID:"access_key_id",
    SECRET_ACCESS_KEY:"secret_access_key"
  },
  DEPLOYED_REDIS_HOST: credentials.DEPLOYED_REDIS_HOST,
  DEPLOYED_REDIS_PORT: credentials.DEPLOYED_REDIS_PORT,
  DEPLOYED_REDIS_PASSWORD: credentials.DEPLOYED_REDIS_PASSWORD,
  CACHESECRETKEY: credentials.CACHESECRETKEY,
  ENUMVALUEOFCOUNTRY: [
    "Andorra",
    "United Arab Emirates",
    "Afghanistan",
    "Antigua and Barbuda",
    "Anguilla",
    "Albania",
    "Armenia",
    "Angola",
    "Antarctica",
    "Argentina",
    "American Samoa",
    "Austria",
    "Australia",
    "Aruba",
    "Alland Islands",
    "Azerbaijan",
    "Bosnia and Herzegovina",
    "Barbados",
    "Bangladesh",
    "Belgium",
    "Burkina Faso",
    "Bulgaria",
    "Bahrain",
    "Burundi",
    "Benin",
    "Saint Barthelemy",
    "Bermuda",
    "Brunei Darussalam",
    "Bolivia",
    "Brazil",
    "Bahamas",
    "Bhutan",
    "Bouvet Island",
    "Botswana",
    "Belarus",
    "Belize",
    "Canada",
    "Cocos (Keeling) Islands",
    "Congo, Democratic Republic of the",
    "Central African Republic",
    "Congo, Republic of the",
    "Switzerland",
    "Cote d'Ivoire",
    "Cook Islands",
    "Chile",
    "Cameroon",
    "China",
    "Colombia",
    "Costa Rica",
    "Cuba",
    "Cape Verde",
    "Curacao",
    "Christmas Island",
    "Cyprus",
    "Czech Republic",
    "Germany",
    "Djibouti",
    "Denmark",
    "Dominica",
    "Dominican Republic",
    "Algeria",
    "Ecuador",
    "Estonia",
    "Egypt",
    "Western Sahara",
    "Eritrea",
    "Spain",
    "Ethiopia",
    "Finland",
    "Fiji",
    "Falkland Islands (Malvinas)",
    "Micronesia, Federated States of",
    "Faroe Islands",
    "France",
    "Gabon",
    "United Kingdom",
    "Grenada",
    "Georgia",
    "French Guiana",
    "Guernsey",
    "Ghana",
    "Gibraltar",
    "Greenland",
    "Gambia",
    "Guinea",
    "Guadeloupe",
    "Equatorial Guinea",
    "Greece",
    "South Georgia and the South Sandwich Islands",
    "Guatemala",
    "Guam",
    "Guinea-Bissau",
    "Guyana",
    "Hong Kong",
    "Heard Island and McDonald Islands",
    "Honduras",
    "Croatia",
    "Haiti",
    "Hungary",
    "Indonesia",
    "Ireland",
    "Israel",
    "Isle of Man",
    "India",
    "British Indian Ocean Territory",
    "Iraq",
    "Iran, Islamic Republic of",
    "Iceland",
    "Italy",
    "Jersey",
    "Jamaica",
    "Jordan",
    "Japan",
    "Kenya",
    "Kyrgyzstan",
    "Cambodia",
    "Kiribati",
    "Comoros",
    "Saint Kitts and Nevis",
    "Korea, Democratic People's Republic of",
    "Korea, Republic of",
    "Kuwait",
    "Cayman Islands",
    "Kazakhstan",
    "Lao People's Democratic Republic",
    "Lebanon",
    "Saint Lucia",
    "Liechtenstein",
    "Sri Lanka",
    "Liberia",
    "Lesotho",
    "Lithuania",
    "Luxembourg",
    "Latvia",
    "Libya",
    "Morocco",
    "Monaco",
    "Moldova, Republic of",
    "Montenegro",
    "Saint Martin (French part)",
    "Madagascar",
    "Marshall Islands",
    "Macedonia, the Former Yugoslav Republic of",
    "Mali",
    "Myanmar",
    "Mongolia",
    "Macao",
    "Northern Mariana Islands",
    "Martinique",
    "Mauritania",
    "Montserrat",
    "Malta",
    "Mauritius",
    "Maldives",
    "Malawi",
    "Mexico",
    "Malaysia",
    "Mozambique",
    "Namibia",
    "New Caledonia",
    "Niger",
    "Norfolk Island",
    "Nigeria",
    "Nicaragua",
    "Netherlands",
    "Norway",
    "Nepal",
    "Nauru",
    "Niue",
    "New Zealand",
    "Oman",
    "Panama",
    "Peru",
    "French Polynesia",
    "Papua New Guinea",
    "Philippines",
    "Pakistan",
    "Poland",
    "Saint Pierre and Miquelon",
    "Pitcairn",
    "Puerto Rico",
    "Palestine, State of",
    "Portugal",
    "Palau",
    "Paraguay",
    "Qatar",
    "Reunion",
    "Romania",
    "Serbia",
    "Russian Federation",
    "Rwanda",
    "Saudi Arabia",
    "Solomon Islands",
    "Seychelles",
    "Sudan",
    "Sweden",
    "Singapore",
    "Saint Helena",
    "Slovenia",
    "Svalbard and Jan Mayen",
    "Slovakia",
    "Sierra Leone",
    "San Marino",
    "Senegal",
    "Somalia",
    "Suriname",
    "South Sudan",
    "Sao Tome and Principe",
    "El Salvador",
    "Sint Maarten (Dutch part)",
    "Syrian Arab Republic",
    "Swaziland",
    "Turks and Caicos Islands",
    "Chad",
    "French Southern Territories",
    "Togo",
    "Thailand",
    "Tajikistan",
    "Tokelau",
    "Timor-Leste",
    "Turkmenistan",
    "Tunisia",
    "Tonga",
    "Turkey",
    "Trinidad and Tobago",
    "Tuvalu",
    "Taiwan, Province of China",
    "United Republic of Tanzania",
    "Ukraine",
    "Uganda",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Holy See (Vatican City State)",
    "Saint Vincent and the Grenadines",
    "Venezuela",
    "British Virgin Islands",
    "US Virgin Islands",
    "Vietnam",
    "Vanuatu",
    "Wallis and Futuna",
    "Samoa",
    "Kosovo",
    "Yemen",
    "Mayotte",
    "South Africa",
    "Zambia",
    "Zimbabwe",
  ],
    ENDPOINTS: {
        BASE_URL: "/api/v1",
        USER_LOGIN: "/user/login",
        REGISTER: "/users",
        LOGOUT: "/logout",
        NEWTOKENS: "/newtokens",
        FORGOTPASSWORD: "/forgot/password",
        RESETPASSWORD: "/reset/password",
        UPDATEPASSWORD: "/update/password/:userId",
        GETUSERINFO: "/user/:userId",
        UPDATEUSERINFO: "/user/:userId",
        USERS_LIST: "/users/list",
        READ_CSV_FILE: "/csv",
        LIST_QUESTION_BY_CATEGORY_ID:'/question/category/:categoryId',
        TAKE_TEST:"/questions/test/take",
        UPDATE_QUESTION:"/questions/edit/:question",
        LIST_QUESTIONS:"/questions/list",
      },

};