const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const db = new sqlite3.Database("careercarvedatabase");
const path = require('path');


app.use(cors());
app.use(express.json());

db.run(`CREATE TABLE IF NOT EXISTS mentorstable(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,availability TEXT,areas_of_expertise TEXT, is_premium INTEGER  )`);
db.run(`CREATE TABLE IF NOT EXISTS student(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,availability TEXT,area_of_interest TEXT  )`);
db.run(`CREATE TABLE IF NOT EXISTS session(id INTEGER PRIMARY KEY AUTOINCREMENT,mentor_id INTEGER,student_id INTEGER,scheduled_time TIMESTAMP,status TEXT, FOREIGN KEY (mentor_id) REFERENCES Mentors(id),FOREIGN KEY (student_id) REFERENCES Students(id))`);


const mentors = [
    {
        name: "Anil",
        availability: {
            "Monday": ["9:00-9:30","13:00-14:00", "14:00-14:30"],
            "Wednesday": ["10:00-11:30","12:00-12:30","13:00-14:00"]
        },
        areas_of_expertise: "Strategic Sales Management",
        is_premium: "1"
    },
    {
        name: "Sreeja",
        availability: {
            "Tuesday": ["9:00-9:30","12:00-13:30","13:00-14:00"],
            "Thursday": ["9:00-9:30","13:00-14:00",'15:00-16:30']
        },
        areas_of_expertise: "Digital Transformation & Innovation",
        is_premium: "0"
    },
    {
        name: "Balu",
        availability: {
            "Friday": ["9:00-9:30","12:00-12:30","13:00-14:00"],
            "Saturday": ["9:00-9:30","13:00-14:00","14:00-15:30"]
        },
        areas_of_expertise: "Financial Analysis & Investment Strategy",
        is_premium: "1"
    },
    {
        name: "Sravan",
        availability: {
            "Tuesday": ["9:00-9:30","12:00-12:30","13:00-14:00"],
            "Monday": ["9:00-9:30",'13:00-13:30','15:00-16:30']
        },
        areas_of_expertise: "E-Commerce & Online Retail Optimization",
        is_premium: "0"
    },
    {
        name: "Sruthi",
        availability: {
            "Saturday": ["9:00-9:30","12:00-12:30","13:00-14:00"],
            "Monday": ["9:00-9:30",'13:00-13:30','15:00-16:30']
        },
        areas_of_expertise: "E-Commerce & Online Retail Optimization",
        is_premium: "0"
    },
    {
        name: "Srinivas",
        availability: {
            "Saturday": ["9:00-9:30","12:00-12:30","13:00-14:00"],
            "Monday": ["9:00-9:30",'14:00-14:30','15:00-16:30']
        },
        areas_of_expertise: "Supply Chain & Operations Excellence",
        is_premium: "0"
    },
    {
    name: "Suresh",
        availability: {
            "Saturday": ["9:00-9:30","11:00-12:30",'15:00-16:30'],
            "Monday": ["9:00-9:30",'15:00-16:30']
        },
        areas_of_expertise: "Supply Chain & Operations Excellence",
        is_premium: "1"
    }
];

mentors.forEach(mentor => {
    const name = mentor.name;
    const availabilityJson = JSON.stringify(mentor.availability);
    const areas_of_expertise = mentor.areas_of_expertise;
    const is_premium = mentor.is_premium;

    // Check if mentor already exists
    db.get('SELECT * FROM mentorstable WHERE name = ?', [name], (err, row) => {
        if (err) {
            return console.error(err.message);
        }

        if (!row) {
            // If the mentor doesn't exist, insert the new mentor
            db.run(`INSERT INTO mentorstable (name, availability, areas_of_expertise, is_premium) VALUES (?, ?, ?, ?)`,
                [name, availabilityJson, areas_of_expertise, is_premium],
                function (err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log(`A row has been inserted with rowid ${this.lastID}`);
                });
        } else {
            console.log(`Mentor ${name} already exists in the database.`);
        }
    });
});

app.get('/mentors', (req, res) => {
    const { areas_of_expertise } = req.query;

    let sql = 'SELECT * FROM mentorstable';
    const params = [];

    if (areas_of_expertise) {
        sql += ' WHERE areas_of_expertise = ?';
        params.push(areas_of_expertise); // No need to stringify
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).send("Error fetching mentors.");
        }

        // Parse availability from JSON string to an object
        const parsedRows = rows.map(row => {
            return {
                ...row,
                availability: JSON.parse(row.availability)
            };
        });

        res.json(parsedRows);
    });
});





app.post('/booking',(req,res) => {
    const {name,availability,area_of_interest} = req.body 
    db.run("INSERT INTO student (name,availability,area_of_interest) values (?,?,?)",
        [name,availability,area_of_interest],
        function (err){
            if(err) return res.status(500).send("Error Booking");
            res.status(201).send({id:this.lastID})

        }
    ) 

})

app.get('/booking', (req, res) => {
    const { student_name, area_of_interest } = req.query;

    let sql = 'SELECT * FROM student';
    const params = [];

    if (student_name || area_of_interest) {
        sql += ' WHERE';
        if (student_name) {
            sql += ' name = ?';
            params.push(student_name);
        }
        if (area_of_interest) {
            if (params.length) {
                sql += ' AND';
            }
            sql += ' area_of_interest = ?';
            params.push(area_of_interest);
        }
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).send("Error fetching bookings.");
        }
        res.json(rows);
    });
});

app.use(express.static(path.join(__dirname, 'public')));

// Handle any other requests and return the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(5000,() =>{
    console.log('Server running on http://localhost:5000');
});