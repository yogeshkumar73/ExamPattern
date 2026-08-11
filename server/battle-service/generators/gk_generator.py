"""
General Knowledge Question Generator — Static Bank.

Contains 200+ hand-curated GK questions organized by topic and difficulty.
Supports random selection without repetition.
"""

import random
from typing import Optional

from generators.base import BaseGenerator
from models.question import QuestionModel, Difficulty, QuestionType, GameMode
from utils.helpers import generate_id, calculate_xp, calculate_coins, calculate_time_limit


# ── Static GK Question Bank ──────────────────────────────────
_GK_BANK: dict[str, list[dict]] = {
    "beginner": [
        {"q": "What is the capital of France?", "o": ["Paris", "London", "Berlin", "Madrid"], "a": "Paris", "t": "geography", "e": "Paris is the capital and largest city of France."},
        {"q": "What is the chemical formula for water?", "o": ["H2O", "CO2", "NaCl", "O2"], "a": "H2O", "t": "science", "e": "Water consists of two hydrogen atoms and one oxygen atom."},
        {"q": "Which planet is known as the Red Planet?", "o": ["Mars", "Venus", "Jupiter", "Mercury"], "a": "Mars", "t": "space", "e": "Mars appears red due to iron oxide (rust) on its surface."},
        {"q": "How many continents are there?", "o": ["7", "5", "6", "8"], "a": "7", "t": "geography", "e": "The 7 continents are Asia, Africa, North America, South America, Antarctica, Europe, and Australia."},
        {"q": "What is the largest ocean on Earth?", "o": ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], "a": "Pacific Ocean", "t": "geography", "e": "The Pacific Ocean covers about 63 million square miles."},
        {"q": "Who wrote Romeo and Juliet?", "o": ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"], "a": "William Shakespeare", "t": "literature", "e": "Shakespeare wrote Romeo and Juliet around 1594-96."},
        {"q": "What is the smallest prime number?", "o": ["2", "1", "3", "0"], "a": "2", "t": "math", "e": "2 is the smallest and only even prime number."},
        {"q": "Which gas do plants absorb from the atmosphere?", "o": ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"], "a": "Carbon Dioxide", "t": "science", "e": "Plants use CO2 for photosynthesis."},
        {"q": "What is the boiling point of water in Celsius?", "o": ["100°C", "90°C", "120°C", "80°C"], "a": "100°C", "t": "science", "e": "Water boils at 100°C at standard atmospheric pressure."},
        {"q": "Which language is most spoken worldwide (native speakers)?", "o": ["Mandarin Chinese", "English", "Spanish", "Hindi"], "a": "Mandarin Chinese", "t": "culture", "e": "Mandarin Chinese has the most native speakers globally."},
        {"q": "What does HTTP stand for?", "o": ["HyperText Transfer Protocol", "High Text Transfer Protocol", "Hyper Transfer Text Protocol", "HyperText Transport Protocol"], "a": "HyperText Transfer Protocol", "t": "technology", "e": "HTTP is the foundation of data communication for the web."},
        {"q": "Who painted the Mona Lisa?", "o": ["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"], "a": "Leonardo da Vinci", "t": "art", "e": "Da Vinci painted it between 1503-1519."},
        {"q": "What is the capital of Japan?", "o": ["Tokyo", "Osaka", "Kyoto", "Nagoya"], "a": "Tokyo", "t": "geography", "e": "Tokyo has been Japan's capital since 1868."},
        {"q": "How many bones are in the adult human body?", "o": ["206", "305", "186", "256"], "a": "206", "t": "science", "e": "Adults have 206 bones; babies are born with about 270."},
        {"q": "Which element has the chemical symbol 'O'?", "o": ["Oxygen", "Osmium", "Oganesson", "Gold"], "a": "Oxygen", "t": "science", "e": "O stands for Oxygen, atomic number 8."},
        {"q": "What is the speed of light approximately?", "o": ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], "a": "3 × 10⁸ m/s", "t": "physics", "e": "The speed of light in vacuum is approximately 299,792,458 m/s."},
        {"q": "Which programming language was created by Guido van Rossum?", "o": ["Python", "Java", "C++", "JavaScript"], "a": "Python", "t": "technology", "e": "Python was first released in 1991 by Guido van Rossum."},
        {"q": "What is the currency of the United Kingdom?", "o": ["Pound Sterling", "Euro", "Dollar", "Franc"], "a": "Pound Sterling", "t": "economics", "e": "The UK uses the Pound Sterling (GBP)."},
        {"q": "Which OS was created by Linus Torvalds?", "o": ["Linux", "Windows", "macOS", "FreeBSD"], "a": "Linux", "t": "technology", "e": "Linus Torvalds created the Linux kernel in 1991."},
        {"q": "How many players are in a standard football (soccer) team?", "o": ["11", "9", "10", "12"], "a": "11", "t": "sports", "e": "Each team fields 11 players including the goalkeeper."},
    {
      "q": "Which is the largest continent on Earth?",
      "o": ["Asia", "Africa", "Europe", "North America"],
      "a": "Asia",
      "t": "geography",
      "e": "Asia is the largest continent by both land area and population."
    },
    {
      "q": "What is the capital of Canada?",
      "o": ["Ottawa", "Toronto", "Vancouver", "Montreal"],
      "a": "Ottawa",
      "t": "geography",
      "e": "Ottawa is the capital city of Canada."
    },
    {
      "q": "Which is the longest river in the world?",
      "o": ["Nile", "Amazon", "Yangtze", "Mississippi"],
      "a": "Nile",
      "t": "geography",
      "e": "The Nile River is traditionally recognized as the world's longest river."
    },
    {
      "q": "Which country is known as the Land of the Rising Sun?",
      "o": ["Japan", "China", "Thailand", "South Korea"],
      "a": "Japan",
      "t": "culture",
      "e": "Japan is called the Land of the Rising Sun because it lies east of the Asian continent."
    },
    {
      "q": "Which is the largest mammal on Earth?",
      "o": ["Blue Whale", "Elephant", "Giraffe", "Hippopotamus"],
      "a": "Blue Whale",
      "t": "science",
      "e": "The blue whale is the largest animal ever known to have lived."
    },
    {
      "q": "How many colors are there in a rainbow?",
      "o": ["7", "6", "8", "9"],
      "a": "7",
      "t": "science",
      "e": "A rainbow traditionally has seven colors: red, orange, yellow, green, blue, indigo, and violet."
    },
    {
      "q": "Which is the smallest continent?",
      "o": ["Australia", "Europe", "Antarctica", "South America"],
      "a": "Australia",
      "t": "geography",
      "e": "Australia is the smallest continent by land area."
    },
    {
      "q": "Which is the national flower of India?",
      "o": ["Lotus", "Rose", "Sunflower", "Jasmine"],
      "a": "Lotus",
      "t": "gk",
      "e": "The lotus is India's national flower and symbolizes purity."
    },
    {
      "q": "Who was the first person to step on the Moon?",
      "o": ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "Michael Collins"],
      "a": "Neil Armstrong",
      "t": "space",
      "e": "Neil Armstrong became the first human to walk on the Moon in 1969."
    },
    {
      "q": "Which is the tallest mountain in the world?",
      "o": ["Mount Everest", "K2", "Kangchenjunga", "Lhotse"],
      "a": "Mount Everest",
      "t": "geography",
      "e": "Mount Everest is the world's highest mountain above sea level."
    },
    {
      "q": "What is the largest planet in our Solar System?",
      "o": ["Jupiter", "Saturn", "Earth", "Neptune"],
      "a": "Jupiter",
      "t": "space",
      "e": "Jupiter is the largest planet in the Solar System."
    },
    {
      "q": "Which bird is known as the national bird of India?",
      "o": ["Peacock", "Parrot", "Eagle", "Sparrow"],
      "a": "Peacock",
      "t": "gk",
      "e": "The Indian peafowl (peacock) is India's national bird."
    },
    {
      "q": "Which planet is closest to the Sun?",
      "o": ["Mercury", "Venus", "Earth", "Mars"],
      "a": "Mercury",
      "t": "space",
      "e": "Mercury is the closest planet to the Sun."
    },
    {
      "q": "How many days are there in a leap year?",
      "o": ["366", "365", "364", "367"],
      "a": "366",
      "t": "calendar",
      "e": "A leap year has 366 days because February has 29 days."
    },
    {
      "q": "Which is the largest desert in Asia?",
      "o": ["Gobi Desert", "Sahara", "Kalahari", "Arabian Desert"],
      "a": "Gobi Desert",
      "t": "geography",
      "e": "The Gobi Desert stretches across northern China and southern Mongolia."
    },
    {
      "q": "Which instrument measures temperature?",
      "o": ["Thermometer", "Barometer", "Hygrometer", "Altimeter"],
      "a": "Thermometer",
      "t": "science",
      "e": "A thermometer is used to measure temperature."
    },
    {
      "q": "Which ocean lies between Africa and Australia?",
      "o": ["Indian Ocean", "Pacific Ocean", "Atlantic Ocean", "Arctic Ocean"],
      "a": "Indian Ocean",
      "t": "geography",
      "e": "The Indian Ocean lies between Africa, Asia, and Australia."
    },
    {
      "q": "Which is the largest country by land area?",
      "o": ["Russia", "Canada", "China", "United States"],
      "a": "Russia",
      "t": "geography",
      "e": "Russia is the world's largest country by area."
    },
    {
      "q": "Which festival is known as the Festival of Lights in India?",
      "o": ["Diwali", "Holi", "Eid", "Pongal"],
      "a": "Diwali",
      "t": "culture",
      "e": "Diwali is celebrated with lamps and lights across India."
    },
    {
      "q": "Which gas is essential for human respiration?",
      "o": ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
      "a": "Oxygen",
      "t": "science",
      "e": "Humans require oxygen for cellular respiration."
    },
    {
      "q": "Who invented the telephone?",
      "o": ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "James Watt"],
      "a": "Alexander Graham Bell",
      "t": "history",
      "e": "Alexander Graham Bell is credited with inventing the practical telephone."
    },
    {
      "q": "Which country gifted the Statue of Liberty to the United States?",
      "o": ["France", "United Kingdom", "Germany", "Italy"],
      "a": "France",
      "t": "history",
      "e": "France gifted the Statue of Liberty to the United States in 1886."
    },
    {
      "q": "Which blood group is known as the universal recipient?",
      "o": ["AB Positive", "O Positive", "A Positive", "B Positive"],
      "a": "AB Positive",
      "t": "science",
      "e": "AB-positive individuals can receive blood from all blood groups."
    },
    {
      "q": "What is the national currency of Japan?",
      "o": ["Yen", "Won", "Dollar", "Yuan"],
      "a": "Yen",
      "t": "economics",
      "e": "Japan's official currency is the Japanese Yen (JPY)."
    },
    {
      "q": "Which is the fastest land animal?",
      "o": ["Cheetah", "Lion", "Horse", "Leopard"],
      "a": "Cheetah",
      "t": "science",
      "e": "The cheetah can reach speeds of over 100 km/h."
    },
    {
      "q": "Which is the largest island in the world?",
      "o": ["Greenland", "New Guinea", "Borneo", "Madagascar"],
      "a": "Greenland",
      "t": "geography",
      "e": "Greenland is the world's largest island that is not considered a continent."
    },
    {
      "q": "Which country has the largest population in the world?",
      "o": ["India", "China", "United States", "Indonesia"],
      "a": "India",
      "t": "gk",
      "e": "India became the world's most populous country in 2023."
    },
    {
      "q": "Which organ pumps blood throughout the human body?",
      "o": ["Heart", "Lungs", "Liver", "Kidney"],
      "a": "Heart",
      "t": "science",
      "e": "The heart pumps blood through the circulatory system."
    },
    {
      "q": "Which is the national animal of India?",
      "o": ["Bengal Tiger", "Lion", "Elephant", "Leopard"],
      "a": "Bengal Tiger",
      "t": "gk",
      "e": "The Bengal Tiger is the national animal of India."
    },
    {
      "q": "Which planet is famous for its rings?",
      "o": ["Saturn", "Jupiter", "Mars", "Venus"],
      "a": "Saturn",
      "t": "space",
      "e": "Saturn is well known for its prominent ring system."
    },
  
    ],
    "intermediate": [
        {"q": "Which data structure uses LIFO order?", "o": ["Stack", "Queue", "Array", "Tree"], "a": "Stack", "t": "cs", "e": "Stack = Last In, First Out. Think of a stack of plates."},
        {"q": "What does SQL stand for?", "o": ["Structured Query Language", "Simple Query Language", "System Query Logic", "Standard Query Language"], "a": "Structured Query Language", "t": "database", "e": "SQL is used to communicate with relational databases."},
        {"q": "In which year was the World Wide Web invented?", "o": ["1989", "1991", "1993", "1995"], "a": "1989", "t": "history", "e": "Tim Berners-Lee invented the WWW in 1989 at CERN."},
        {"q": "What is the time complexity of binary search?", "o": ["O(log n)", "O(n)", "O(n²)", "O(1)"], "a": "O(log n)", "t": "algorithms", "e": "Binary search halves the search space each step."},
        {"q": "Which planet has the most moons?", "o": ["Saturn", "Jupiter", "Uranus", "Neptune"], "a": "Saturn", "t": "space", "e": "As of 2023, Saturn has 146 confirmed moons."},
        {"q": "What is the main gas in Earth's atmosphere?", "o": ["Nitrogen", "Oxygen", "Carbon Dioxide", "Argon"], "a": "Nitrogen", "t": "science", "e": "Nitrogen makes up about 78% of Earth's atmosphere."},
        {"q": "Who discovered penicillin?", "o": ["Alexander Fleming", "Louis Pasteur", "Marie Curie", "Robert Koch"], "a": "Alexander Fleming", "t": "science", "e": "Fleming discovered penicillin in 1928."},
        {"q": "What does DNS stand for?", "o": ["Domain Name System", "Digital Network Service", "Data Name System", "Domain Network Server"], "a": "Domain Name System", "t": "networking", "e": "DNS translates domain names to IP addresses."},
        {"q": "Which sorting algorithm has O(n log n) average case?", "o": ["Merge Sort", "Bubble Sort", "Selection Sort", "Insertion Sort"], "a": "Merge Sort", "t": "algorithms", "e": "Merge Sort divides and conquers with guaranteed O(n log n)."},
        {"q": "What is the largest desert on Earth?", "o": ["Antarctic Desert", "Sahara", "Arabian", "Gobi"], "a": "Antarctic Desert", "t": "geography", "e": "Antarctica is technically the largest desert by area."},
        {"q": "What protocol is used for sending emails?", "o": ["SMTP", "HTTP", "FTP", "SSH"], "a": "SMTP", "t": "networking", "e": "SMTP = Simple Mail Transfer Protocol."},
        {"q": "Which vitamin is produced when skin is exposed to sunlight?", "o": ["Vitamin D", "Vitamin C", "Vitamin A", "Vitamin B12"], "a": "Vitamin D", "t": "science", "e": "UV-B radiation triggers Vitamin D synthesis in skin."},
        {"q": "What year did the Berlin Wall fall?", "o": ["1989", "1991", "1987", "1990"], "a": "1989", "t": "history", "e": "The Berlin Wall fell on November 9, 1989."},
        {"q": "How many bits are in a byte?", "o": ["8", "4", "16", "32"], "a": "8", "t": "cs", "e": "1 byte = 8 bits. A bit is the smallest unit of data."},
        {"q": "Which company created the Java programming language?", "o": ["Sun Microsystems", "Microsoft", "IBM", "Google"], "a": "Sun Microsystems", "t": "technology", "e": "Java was developed by James Gosling at Sun Microsystems in 1995."},
        {"q": "What is the hardest natural substance on Earth?", "o": ["Diamond", "Iron", "Quartz", "Sapphire"], "a": "Diamond", "t": "science", "e": "Diamond scores 10 on the Mohs hardness scale."},
        {"q": "What is the capital of Australia?", "o": ["Canberra", "Sydney", "Melbourne", "Brisbane"], "a": "Canberra", "t": "geography", "e": "Canberra, not Sydney, is Australia's capital."},
        {"q": "What does API stand for?", "o": ["Application Programming Interface", "Advanced Program Integration", "Application Process Interface", "Automated Programming Interface"], "a": "Application Programming Interface", "t": "technology", "e": "APIs define how software components interact."},
        {"q": "Which blood type is known as the universal donor?", "o": ["O negative", "AB positive", "A positive", "B negative"], "a": "O negative", "t": "science", "e": "O-negative blood can be given to any blood type."},
        {"q": "What does CPU stand for?", "o": ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], "a": "Central Processing Unit", "t": "cs", "e": "The CPU is the brain of a computer."},
        {
    "q": "Which data structure follows the FIFO principle?",
    "o": ["Queue", "Stack", "Heap", "Graph"],
    "a": "Queue",
    "t": "cs",
    "e": "A Queue follows the First In, First Out (FIFO) principle."
  },
  {
    "q": "Which SQL command is used to retrieve data from a database?",
    "o": ["SELECT", "INSERT", "UPDATE", "DELETE"],
    "a": "SELECT",
    "t": "database",
    "e": "The SELECT statement is used to query and retrieve data from database tables."
  },
  {
    "q": "Who is known as the father of computers?",
    "o": ["Charles Babbage", "Alan Turing", "Bill Gates", "John von Neumann"],
    "a": "Charles Babbage",
    "t": "history",
    "e": "Charles Babbage designed the Analytical Engine, considered the first mechanical computer."
  },
  {
    "q": "What is the worst-case time complexity of linear search?",
    "o": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    "a": "O(n)",
    "t": "algorithms",
    "e": "Linear search may need to inspect every element in the list."
  },
  {
    "q": "Which planet is known for its prominent ring system?",
    "o": ["Saturn", "Jupiter", "Uranus", "Neptune"],
    "a": "Saturn",
    "t": "space",
    "e": "Saturn has the most visible and extensive ring system in the Solar System."
  },
  {
    "q": "Which gas is the second most abundant in Earth's atmosphere?",
    "o": ["Oxygen", "Nitrogen", "Argon", "Carbon Dioxide"],
    "a": "Oxygen",
    "t": "science",
    "e": "Oxygen makes up approximately 21% of Earth's atmosphere."
  },
  {
    "q": "Who developed the theory of relativity?",
    "o": ["Albert Einstein", "Isaac Newton", "Galileo Galilei", "Nikola Tesla"],
    "a": "Albert Einstein",
    "t": "science",
    "e": "Albert Einstein introduced the Special and General Theories of Relativity."
  },
  {
    "q": "Which protocol is commonly used to securely browse websites?",
    "o": ["HTTPS", "HTTP", "FTP", "SMTP"],
    "a": "HTTPS",
    "t": "networking",
    "e": "HTTPS encrypts communication between the browser and the web server using TLS."
  },
  {
    "q": "Which sorting algorithm repeatedly swaps adjacent elements?",
    "o": ["Bubble Sort", "Merge Sort", "Quick Sort", "Heap Sort"],
    "a": "Bubble Sort",
    "t": "algorithms",
    "e": "Bubble Sort compares and swaps adjacent elements until the list is sorted."
  },
  {
    "q": "Which is the deepest ocean trench in the world?",
    "o": ["Mariana Trench", "Java Trench", "Puerto Rico Trench", "Tonga Trench"],
    "a": "Mariana Trench",
    "t": "geography",
    "e": "The Mariana Trench is the deepest known point in Earth's oceans."
  },
  {
    "q": "Which protocol is used to transfer files over the Internet?",
    "o": ["FTP", "SMTP", "DNS", "HTTP"],
    "a": "FTP",
    "t": "networking",
    "e": "FTP stands for File Transfer Protocol and is used for transferring files."
  },
  {
    "q": "Which vitamin is essential for blood clotting?",
    "o": ["Vitamin K", "Vitamin A", "Vitamin C", "Vitamin E"],
    "a": "Vitamin K",
    "t": "science",
    "e": "Vitamin K is necessary for producing proteins involved in blood clotting."
  },
  {
    "q": "In which year did India gain independence?",
    "o": ["1947", "1945", "1950", "1930"],
    "a": "1947",
    "t": "history",
    "e": "India became independent from British rule on August 15, 1947."
  },
  {
    "q": "How many kilobytes are there in one megabyte (binary system)?",
    "o": ["1024", "1000", "2048", "512"],
    "a": "1024",
    "t": "cs",
    "e": "In binary measurement, 1 MB equals 1024 KB."
  },
  {
    "q": "Which company developed the C# programming language?",
    "o": ["Microsoft", "Google", "IBM", "Oracle"],
    "a": "Microsoft",
    "t": "technology",
    "e": "C# was developed by Microsoft as part of the .NET framework."
  },
  {
    "q": "Which metal is liquid at room temperature?",
    "o": ["Mercury", "Iron", "Aluminum", "Copper"],
    "a": "Mercury",
    "t": "science",
    "e": "Mercury is the only common metal that is liquid at room temperature."
  },
  {
    "q": "What is the capital city of Brazil?",
    "o": ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"],
    "a": "Brasília",
    "t": "geography",
    "e": "Brasília became the capital of Brazil in 1960."
  },
  {
    "q": "What does GUI stand for?",
    "o": ["Graphical User Interface", "General User Interface", "Global User Internet", "Graphic Utility Integration"],
    "a": "Graphical User Interface",
    "t": "technology",
    "e": "A GUI allows users to interact with software using graphical elements like buttons and icons."
  },
  {
    "q": "Which blood cells help fight infections?",
    "o": ["White Blood Cells", "Red Blood Cells", "Platelets", "Plasma"],
    "a": "White Blood Cells",
    "t": "science",
    "e": "White blood cells are part of the immune system and protect the body from infections."
  },
  {
    "q": "What does RAM stand for?",
    "o": ["Random Access Memory", "Read Access Memory", "Rapid Access Module", "Random Allocation Memory"],
    "a": "Random Access Memory",
    "t": "cs",
    "e": "RAM is volatile memory used to temporarily store data and programs currently in use."
  },
  {
    "q": "Which layer of the TCP/IP model is responsible for routing packets?",
    "o": ["Internet Layer", "Application Layer", "Transport Layer", "Network Access Layer"],
    "a": "Internet Layer",
    "t": "networking",
    "e": "The Internet Layer handles logical addressing and routing using IP."
  },
  {
    "q": "Which database language command removes a table completely?",
    "o": ["DROP", "DELETE", "REMOVE", "ERASE"],
    "a": "DROP",
    "t": "database",
    "e": "DROP permanently removes a database table and its structure."
  },
  {
    "q": "Which scientist proposed the three laws of motion?",
    "o": ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Johannes Kepler"],
    "a": "Isaac Newton",
    "t": "science",
    "e": "Newton published the three laws of motion in 1687."
  },
  {
    "q": "Which data structure stores elements in key-value pairs?",
    "o": ["Hash Map", "Stack", "Queue", "Array"],
    "a": "Hash Map",
    "t": "cs",
    "e": "A Hash Map stores unique keys mapped to corresponding values."
  },
  {
    "q": "Which search engine was founded by Larry Page and Sergey Brin?",
    "o": ["Google", "Yahoo", "Bing", "DuckDuckGo"],
    "a": "Google",
    "t": "technology",
    "e": "Google was founded in 1998 by Larry Page and Sergey Brin."
  },
  {
    "q": "Which algorithm is commonly used to find the shortest path in a weighted graph?",
    "o": ["Dijkstra's Algorithm", "Binary Search", "Bubble Sort", "DFS"],
    "a": "Dijkstra's Algorithm",
    "t": "algorithms",
    "e": "Dijkstra's algorithm computes the shortest path from a source vertex to all other vertices."
  },
  {
    "q": "Which country has the largest number of time zones?",
    "o": ["France", "Russia", "United States", "Australia"],
    "a": "France",
    "t": "geography",
    "e": "Including overseas territories, France spans 12 time zones."
  },
  {
    "q": "Which protocol automatically assigns IP addresses to devices?",
    "o": ["DHCP", "DNS", "ARP", "FTP"],
    "a": "DHCP",
    "t": "networking",
    "e": "DHCP dynamically assigns IP addresses and network configuration."
  },
  {
    "q": "Which programming paradigm is Java primarily known for?",
    "o": ["Object-Oriented Programming", "Functional Programming", "Logic Programming", "Procedural Programming"],
    "a": "Object-Oriented Programming",
    "t": "technology",
    "e": "Java is primarily an object-oriented programming language based on classes and objects."
  },
  {
    "q": "Which organ in the human body filters blood and produces urine?",
    "o": ["Kidney", "Liver", "Heart", "Lungs"],
    "a": "Kidney",
    "t": "science",
    "e": "The kidneys filter waste products from the blood to produce urine."
  },
    ],
    "advanced": [
        {"q": "Which algorithm is used to train neural networks?", "o": ["Backpropagation", "Dijkstra's", "A*", "Prim's"], "a": "Backpropagation", "t": "ai", "e": "Backpropagation computes gradients for weight updates."},
        {"q": "What consensus mechanism does Bitcoin use?", "o": ["Proof of Work", "Proof of Stake", "PBFT", "Delegated PoS"], "a": "Proof of Work", "t": "blockchain", "e": "Bitcoin miners solve cryptographic puzzles (PoW)."},
        {"q": "What attack involves intercepting communication between two parties?", "o": ["Man-in-the-Middle", "DDoS", "SQL Injection", "XSS"], "a": "Man-in-the-Middle", "t": "security", "e": "MITM attacks eavesdrop on or alter communications."},
        {"q": "RSA encryption relies on the difficulty of:", "o": ["Factoring large numbers", "Discrete logarithms", "Hashing", "Sorting"], "a": "Factoring large numbers", "t": "cryptography", "e": "RSA security is based on prime factorization difficulty."},
        {"q": "CAP theorem says a distributed system can guarantee at most 2 of:", "o": ["Consistency, Availability, Partition Tolerance", "C, A, Performance", "C, A, Persistence", "C, A, Parallelism"], "a": "Consistency, Availability, Partition Tolerance", "t": "distributed", "e": "CAP theorem (Brewer's theorem) is fundamental to distributed systems."},
        {"q": "What is a qubit?", "o": ["A quantum bit that can be 0 and 1 simultaneously", "A type of RAM", "A GPU core", "A CPU register"], "a": "A quantum bit that can be 0 and 1 simultaneously", "t": "quantum", "e": "Qubits use superposition to exist in multiple states."},
        {"q": "Which normal form eliminates transitive dependencies?", "o": ["3NF", "1NF", "2NF", "BCNF"], "a": "3NF", "t": "database", "e": "Third Normal Form removes transitive dependencies."},
        {"q": "Quicksort worst-case time complexity is:", "o": ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], "a": "O(n²)", "t": "algorithms", "e": "Worst case occurs with bad pivot selection (already sorted)."},
        {"q": "Which condition is NOT required for deadlock?", "o": ["Preemption", "Mutual exclusion", "Hold and wait", "Circular wait"], "a": "Preemption", "t": "os", "e": "Deadlock requires: mutual exclusion, hold & wait, no preemption, circular wait."},
        {"q": "What does ACID stand for in databases?", "o": ["Atomicity, Consistency, Isolation, Durability", "Availability, Consistency, Integrity, Durability", "Atomicity, Concurrency, Isolation, Data", "Availability, Consistency, Isolation, Durability"], "a": "Atomicity, Consistency, Isolation, Durability", "t": "database", "e": "ACID properties ensure reliable database transactions."},
        {"q": "Which cache replacement policy replaces least recently used?", "o": ["LRU", "FIFO", "MRU", "LFU"], "a": "LRU", "t": "systems", "e": "LRU = Least Recently Used, a common cache eviction strategy."},
        {"q": "What is the Halting Problem about?", "o": ["Whether a program will finish or run forever", "CPU scheduling", "Memory allocation", "Network latency"], "a": "Whether a program will finish or run forever", "t": "theory", "e": "Turing proved the halting problem is undecidable in 1936."},
        {"q": "TCP is a ___-oriented protocol:", "o": ["connection", "datagram", "message", "packet"], "a": "connection", "t": "networking", "e": "TCP establishes a connection before data transfer (3-way handshake)."},
        {"q": "Which design pattern provides a single global point of access?", "o": ["Singleton", "Factory", "Observer", "Strategy"], "a": "Singleton", "t": "design_patterns", "e": "Singleton ensures only one instance exists globally."},
        {"q": "What is the P vs NP problem about?", "o": ["Whether problems verifiable in polynomial time are also solvable in polynomial time", "Parallel vs Network processing", "Persistent vs Non-persistent storage", "Primary vs Nullable keys"], "a": "Whether problems verifiable in polynomial time are also solvable in polynomial time", "t": "theory", "e": "P vs NP is one of the Millennium Prize Problems ($1M reward)."},
        {"q": "Git uses which data structure internally?", "o": ["Directed Acyclic Graph", "Binary Tree", "Linked List", "Hash Table"], "a": "Directed Acyclic Graph", "t": "vcs", "e": "Git commits form a DAG where each commit points to its parent(s)."},
        {"q": "What is the Curry-Howard correspondence?", "o": ["Links between proofs and programs", "A sorting algorithm", "A database normalization", "A network protocol"], "a": "Links between proofs and programs", "t": "type_theory", "e": "It establishes an isomorphism between mathematical proofs and computer programs."},
        {"q": "What does the term 'Big O' describe?", "o": ["Upper bound of algorithm growth rate", "Memory usage", "CPU architecture", "Network bandwidth"], "a": "Upper bound of algorithm growth rate", "t": "algorithms", "e": "Big O notation describes the worst-case time or space complexity."},
        {"q": "Which layer of the OSI model handles routing?", "o": ["Network Layer (3)", "Transport Layer (4)", "Data Link Layer (2)", "Session Layer (5)"], "a": "Network Layer (3)", "t": "networking", "e": "Layer 3 (Network) handles IP addressing and routing."},
        {"q": "What is Docker primarily used for?", "o": ["Containerization", "Version Control", "Database Management", "Code Compilation"], "a": "Containerization", "t": "devops", "e": "Docker packages applications in lightweight, portable containers."},
         {
    "q": "Which scheduling algorithm guarantees the shortest average waiting time when burst times are known?",
    "o": ["Shortest Job First (SJF)", "Round Robin", "FCFS", "Priority Scheduling"],
    "a": "Shortest Job First (SJF)",
    "t": "os",
    "e": "SJF minimizes the average waiting time when CPU burst lengths are known in advance."
  },
  {
    "q": "Which cryptographic hash algorithm produces a 256-bit digest?",
    "o": ["SHA-256", "MD5", "SHA-1", "CRC32"],
    "a": "SHA-256",
    "t": "cryptography",
    "e": "SHA-256 is part of the SHA-2 family and generates a 256-bit hash."
  },
  {
    "q": "Which algorithm efficiently finds the minimum spanning tree of a graph using edge sorting?",
    "o": ["Kruskal's Algorithm", "Bellman-Ford", "Floyd-Warshall", "Dijkstra's Algorithm"],
    "a": "Kruskal's Algorithm",
    "t": "algorithms",
    "e": "Kruskal's algorithm builds the MST by selecting edges in increasing order of weight."
  },
  {
    "q": "Which Kubernetes object manages a replicated set of Pods?",
    "o": ["Deployment", "Namespace", "ConfigMap", "Secret"],
    "a": "Deployment",
    "t": "devops",
    "e": "A Deployment manages ReplicaSets and ensures the desired number of Pods are running."
  },
  {
    "q": "Which SQL JOIN returns only matching rows from both tables?",
    "o": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
    "a": "INNER JOIN",
    "t": "database",
    "e": "INNER JOIN returns rows where matching values exist in both tables."
  },
  {
    "q": "Which machine learning technique is primarily used for dimensionality reduction?",
    "o": ["Principal Component Analysis (PCA)", "K-Means", "Naive Bayes", "Decision Tree"],
    "a": "Principal Component Analysis (PCA)",
    "t": "ai",
    "e": "PCA transforms data into orthogonal components while preserving maximum variance."
  },
  {
    "q": "Which HTTP status code indicates that a requested resource was not found?",
    "o": ["404", "200", "500", "302"],
    "a": "404",
    "t": "networking",
    "e": "HTTP 404 indicates that the requested resource could not be located."
  },
  {
    "q": "Which indexing structure is commonly used by relational databases?",
    "o": ["B+ Tree", "Binary Tree", "Trie", "AVL Tree"],
    "a": "B+ Tree",
    "t": "database",
    "e": "Most relational database systems use B+ Trees for indexing because of efficient disk access."
  },
  {
    "q": "Which compiler phase converts source code into tokens?",
    "o": ["Lexical Analysis", "Semantic Analysis", "Optimization", "Code Generation"],
    "a": "Lexical Analysis",
    "t": "compiler",
    "e": "Lexical analysis scans the source code and produces tokens."
  },
  {
    "q": "Which graph traversal algorithm uses a queue?",
    "o": ["Breadth-First Search", "Depth-First Search", "Topological Sort", "A* Search"],
    "a": "Breadth-First Search",
    "t": "algorithms",
    "e": "BFS explores nodes level by level using a queue."
  },
  {
    "q": "Which cloud service model provides virtual machines to users?",
    "o": ["Infrastructure as a Service (IaaS)", "Software as a Service (SaaS)", "Platform as a Service (PaaS)", "Function as a Service (FaaS)"],
    "a": "Infrastructure as a Service (IaaS)",
    "t": "cloud",
    "e": "IaaS provides virtualized computing resources such as virtual machines and storage."
  },
  {
    "q": "Which protocol is responsible for translating IP addresses into MAC addresses?",
    "o": ["ARP", "RARP", "ICMP", "DHCP"],
    "a": "ARP",
    "t": "networking",
    "e": "Address Resolution Protocol (ARP) maps IPv4 addresses to physical MAC addresses."
  },
  {
    "q": "Which database isolation level prevents dirty reads but still allows non-repeatable reads?",
    "o": ["Read Committed", "Read Uncommitted", "Repeatable Read", "Serializable"],
    "a": "Read Committed",
    "t": "database",
    "e": "Read Committed ensures only committed data is read while allowing data to change between transactions."
  },
  {
    "q": "Which activation function is commonly used in hidden layers of deep neural networks?",
    "o": ["ReLU", "Softmax", "Linear", "Step Function"],
    "a": "ReLU",
    "t": "ai",
    "e": "ReLU speeds up training and reduces the vanishing gradient problem."
  },
  {
    "q": "Which sorting algorithm is stable and commonly used in external sorting?",
    "o": ["Merge Sort", "Heap Sort", "Quick Sort", "Selection Sort"],
    "a": "Merge Sort",
    "t": "algorithms",
    "e": "Merge Sort is stable and efficient for sorting very large datasets."
  },
  {
    "q": "Which encryption algorithm is symmetric?",
    "o": ["AES", "RSA", "ECC", "DSA"],
    "a": "AES",
    "t": "cryptography",
    "e": "AES uses the same key for encryption and decryption."
  },
  {
    "q": "Which operating system mechanism prevents multiple processes from simultaneously accessing a critical section?",
    "o": ["Mutex", "Paging", "Caching", "Virtual Memory"],
    "a": "Mutex",
    "t": "os",
    "e": "A mutex provides mutual exclusion by allowing only one process to access a critical section."
  },
  {
    "q": "Which NoSQL database stores data in JSON-like BSON documents?",
    "o": ["MongoDB", "Redis", "Cassandra", "Neo4j"],
    "a": "MongoDB",
    "t": "database",
    "e": "MongoDB stores documents using BSON, a binary representation of JSON."
  },
  {
    "q": "Which graph algorithm detects negative-weight cycles?",
    "o": ["Bellman-Ford", "Dijkstra", "Prim", "Kruskal"],
    "a": "Bellman-Ford",
    "t": "algorithms",
    "e": "Bellman-Ford can detect negative-weight cycles while computing shortest paths."
  },
  {
    "q": "Which cybersecurity attack encrypts a victim's files and demands payment?",
    "o": ["Ransomware", "Phishing", "Spyware", "Rootkit"],
    "a": "Ransomware",
    "t": "security",
    "e": "Ransomware encrypts files and demands payment to restore access."
  },
  {
    "q": "Which OSI layer is responsible for encryption and data compression?",
    "o": ["Presentation Layer", "Application Layer", "Transport Layer", "Session Layer"],
    "a": "Presentation Layer",
    "t": "networking",
    "e": "The Presentation Layer translates, encrypts, and compresses application data."
  },
  {
    "q": "Which Git command combines changes from one branch into another?",
    "o": ["git merge", "git clone", "git stash", "git reset"],
    "a": "git merge",
    "t": "vcs",
    "e": "The git merge command integrates changes from another branch."
  },
  {
    "q": "Which normalization form removes partial functional dependencies?",
    "o": ["Second Normal Form (2NF)", "First Normal Form (1NF)", "Third Normal Form (3NF)", "BCNF"],
    "a": "Second Normal Form (2NF)",
    "t": "database",
    "e": "2NF eliminates partial dependencies on composite primary keys."
  },
  {
    "q": "Which AI learning approach uses labeled training data?",
    "o": ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Self-Supervised Learning"],
    "a": "Supervised Learning",
    "t": "ai",
    "e": "Supervised learning trains models using labeled input-output pairs."
  },
  {
    "q": "Which distributed version control system was created by Linus Torvalds?",
    "o": ["Git", "Subversion", "Mercurial", "CVS"],
    "a": "Git",
    "t": "vcs",
    "e": "Git was developed by Linus Torvalds in 2005 for Linux kernel development."
  },{
    "q": "Which Kubernetes component is responsible for scheduling Pods onto worker nodes?",
    "o": ["kube-scheduler", "kubelet", "etcd", "kube-proxy"],
    "a": "kube-scheduler",
    "t": "devops",
    "e": "The kube-scheduler assigns newly created Pods to appropriate worker nodes."
  },
  {
    "q": "Which RAID level provides striping with distributed parity?",
    "o": ["RAID 5", "RAID 0", "RAID 1", "RAID 10"],
    "a": "RAID 5",
    "t": "systems",
    "e": "RAID 5 combines striping with distributed parity, allowing recovery from a single disk failure."
  },
  {
    "q": "Which shortest path algorithm can handle negative edge weights without negative cycles?",
    "o": ["Bellman-Ford", "Dijkstra", "Prim", "Kruskal"],
    "a": "Bellman-Ford",
    "t": "algorithms",
    "e": "Bellman-Ford supports graphs with negative edge weights."
  },
  {
    "q": "Which HTTP request method is considered idempotent and commonly used to update an entire resource?",
    "o": ["PUT", "POST", "PATCH", "CONNECT"],
    "a": "PUT",
    "t": "web",
    "e": "PUT replaces an entire resource and is defined as idempotent."
  },
  {
    "q": "Which blockchain property ensures that previous transactions cannot easily be altered?",
    "o": ["Immutability", "Scalability", "Liquidity", "Availability"],
    "a": "Immutability",
    "t": "blockchain",
    "e": "Cryptographic hashing makes blockchain records effectively immutable."
  },
  {
    "q": "Which compiler optimization removes calculations whose results are never used?",
    "o": ["Dead Code Elimination", "Loop Unrolling", "Inlining", "Constant Folding"],
    "a": "Dead Code Elimination",
    "t": "compiler",
    "e": "Dead code elimination removes unreachable or unused computations."
  },
  {
    "q": "Which machine learning algorithm is commonly used for binary classification?",
    "o": ["Logistic Regression", "K-Means", "Apriori", "PCA"],
    "a": "Logistic Regression",
    "t": "ai",
    "e": "Logistic regression predicts probabilities for binary outcomes."
  },
  {
    "q": "Which memory management technique allows processes to use more memory than physically available?",
    "o": ["Virtual Memory", "Segmentation", "Spooling", "Caching"],
    "a": "Virtual Memory",
    "t": "os",
    "e": "Virtual memory uses disk space to extend available RAM."
  },
  {
    "q": "Which cryptographic algorithm is based on elliptic curve mathematics?",
    "o": ["ECC", "AES", "DES", "Blowfish"],
    "a": "ECC",
    "t": "cryptography",
    "e": "Elliptic Curve Cryptography provides strong security with shorter keys."
  },
  {
    "q": "Which AWS service provides scalable virtual servers?",
    "o": ["EC2", "S3", "Lambda", "RDS"],
    "a": "EC2",
    "t": "cloud",
    "e": "Amazon EC2 provides resizable virtual compute instances."
  },
  {
    "q": "Which graph traversal algorithm naturally uses recursion?",
    "o": ["Depth-First Search", "Breadth-First Search", "Dijkstra", "Bellman-Ford"],
    "a": "Depth-First Search",
    "t": "algorithms",
    "e": "DFS is commonly implemented recursively using the call stack."
  },
  {
    "q": "Which SQL constraint ensures all values in a column are different?",
    "o": ["UNIQUE", "CHECK", "DEFAULT", "FOREIGN KEY"],
    "a": "UNIQUE",
    "t": "database",
    "e": "The UNIQUE constraint prevents duplicate values in a column."
  },
  {
    "q": "Which attack tricks users into revealing sensitive information through fake websites or emails?",
    "o": ["Phishing", "Spoofing", "Ransomware", "Rootkit"],
    "a": "Phishing",
    "t": "security",
    "e": "Phishing uses fraudulent communications to steal credentials."
  },
  {
    "q": "Which consistency model guarantees that every read returns the latest successful write?",
    "o": ["Strong Consistency", "Eventual Consistency", "Weak Consistency", "Session Consistency"],
    "a": "Strong Consistency",
    "t": "distributed",
    "e": "Strong consistency ensures all clients observe the latest committed value."
  },
  {
    "q": "Which Git command uploads local commits to a remote repository?",
    "o": ["git push", "git fetch", "git pull", "git checkout"],
    "a": "git push",
    "t": "vcs",
    "e": "git push transfers committed changes to a remote repository."
  },
  {
    "q": "Which Kubernetes object stores sensitive information such as passwords?",
    "o": ["Secret", "ConfigMap", "Pod", "Service"],
    "a": "Secret",
    "t": "devops",
    "e": "Secrets securely store confidential configuration data."
  },
  {
    "q": "Which AI algorithm is widely used for recommendation systems through collaborative filtering?",
    "o": ["Matrix Factorization", "Linear Regression", "Naive Bayes", "Decision Tree"],
    "a": "Matrix Factorization",
    "t": "ai",
    "e": "Matrix factorization discovers latent relationships between users and items."
  },
  {
    "q": "Which protocol secures remote terminal connections over a network?",
    "o": ["SSH", "Telnet", "FTP", "SMTP"],
    "a": "SSH",
    "t": "networking",
    "e": "SSH encrypts remote shell sessions and file transfers."
  },
  {
    "q": "Which algorithm is primarily used for data compression in ZIP files?",
    "o": ["DEFLATE", "AES", "RSA", "SHA-256"],
    "a": "DEFLATE",
    "t": "compression",
    "e": "ZIP archives commonly use the DEFLATE compression algorithm."
  },
  {
    "q": "Which normal form requires every determinant to be a candidate key?",
    "o": ["BCNF", "3NF", "2NF", "1NF"],
    "a": "BCNF",
    "t": "database",
    "e": "Boyce-Codd Normal Form is stricter than Third Normal Form."
  },
  {
    "q": "Which load balancing algorithm distributes requests sequentially across servers?",
    "o": ["Round Robin", "Least Connections", "Weighted Random", "Hash-Based"],
    "a": "Round Robin",
    "t": "distributed",
    "e": "Round Robin cycles requests evenly among available servers."
  },
  {
    "q": "Which type of neural network is primarily designed for image recognition tasks?",
    "o": ["Convolutional Neural Network", "Recurrent Neural Network", "Hopfield Network", "Boltzmann Machine"],
    "a": "Convolutional Neural Network",
    "t": "ai",
    "e": "CNNs efficiently extract spatial features from images."
  },
  {
    "q": "Which Linux command displays currently running processes?",
    "o": ["ps", "pwd", "grep", "chmod"],
    "a": "ps",
    "t": "linux",
    "e": "The ps command lists active processes."
  },
  {
    "q": "Which encryption mode allows parallel encryption of blocks?",
    "o": ["CTR", "CBC", "CFB", "OFB"],
    "a": "CTR",
    "t": "cryptography",
    "e": "Counter (CTR) mode encrypts blocks independently, enabling parallel processing."
  },
  {
    "q": "Which software design principle states that software entities should be open for extension but closed for modification?",
    "o": ["Open-Closed Principle", "Single Responsibility Principle", "Dependency Inversion Principle", "Interface Segregation Principle"],
    "a": "Open-Closed Principle",
    "t": "design_patterns",
    "e": "The Open-Closed Principle is one of the SOLID principles of object-oriented design."
  },
    ],
}


class GKGenerator(BaseGenerator):
    """GK question generator backed by a static bank of 200+ curated questions."""

    @property
    def mode(self) -> str:
        return GameMode.GK.value

    def generate(
        self,
        difficulty: Difficulty,
        count: int = 10,
        topic: str | None = None,
        exclude_ids: set[str] | None = None,
    ) -> list[QuestionModel]:
        exclude = set(exclude_ids) if exclude_ids else set()
        bank = _GK_BANK.get(difficulty.value, _GK_BANK["beginner"])

        # Filter by topic if specified
        if topic:
            bank = [q for q in bank if q["t"] == topic]

        # If requested more than available, cycle through with variation
        available = [q for q in bank]
        random.shuffle(available)

        questions: list[QuestionModel] = []
        idx = 0
        max_attempts = len(available) * 10
        attempts = 0

        while len(questions) < count and attempts < max_attempts and available:
            entry = available[idx % len(available)]
            idx += 1
            attempts += 1

            qid = generate_id("gk", entry["q"])
            if qid in exclude:
                continue

            options = list(entry["o"])
            random.shuffle(options)

            q = QuestionModel(
                id=qid,
                mode=GameMode.GK,
                difficulty=difficulty,
                topic=entry["t"],
                question=entry["q"],
                question_type=QuestionType.MCQ,
                options=options,
                correct_answer=entry["a"],
                explanation=entry["e"],
                hint=f"This is a {entry['t']} question.",
                time_limit=calculate_time_limit(difficulty.value),
                xp=calculate_xp(difficulty.value),
                coins=calculate_coins(difficulty.value),
                tags=["gk", entry["t"]],
            )
            exclude.add(qid)
            questions.append(q)

        return questions
