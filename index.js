const express = require('express');
const path = require('path');
const app = express();
const db = require('./database/db');
const session = require('express-session');
const flash = require('connect-flash');


// Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public')); 
app.use(flash());

// Session middleware
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

const uploadRoutes = require('./routes/upload');
app.use('/', uploadRoutes); 

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session debugging middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});


// Routes
app.get('/', (req, res) => {
    console.log("Session userType:", req.session.userType);
    
    if (req.session.userType === 'student') {
        return res.redirect('/home-student');
    }
    if (req.session.userType === 'teacher') {
        return res.redirect('/home-teacher');
    }
    res.render('home'); // Make sure you have home.ejs in views folder
});

app.get('/login', (req, res) => {
    res.render('login'); // Make sure you have login.ejs in views folder
});

app.get('/reset-password', (req, res) => {
    res.render('resetPassword');
});

app.get('/home-student', (req, res) => {
    if (!req.session.userType || req.session.userType !== 'student') {
        return res.redirect('/login');
    }
    res.render('homeStudent', { session: req.session }); // <-- pass session
});


app.get('/home-teacher', (req, res) => {
    // console.log("Teacher session:", req.session); // Add this
    if (!req.session.userType || req.session.userType !== 'teacher') {
        return res.redirect('/login');
    }
    res.render('homeTeacher', { session: req.session }); // <-- pass session
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log('Logout error:', err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

// Registration handlers
app.post('/register-student', (req, res) => {
    const { regno, stdName, stdSchool, stdBranch, Email, password } = req.body;

    const sql1 = 'INSERT INTO StudentRegister (regno, stdName, stdSchool, stdBranch, Email) VALUES (?, ?, ?, ?, ?)';
    const sql2 = 'INSERT INTO StudentLogin (Email, stuPassword) VALUES (?, ?)';

    db.query(sql1, [regno, stdName, stdSchool, stdBranch, Email], (err1, result1) => {
        if (err1) {
            console.error("Student register error:", err1);
            return res.render('studentRegister', { 
                message: 'Registration failed!', 
                status: 'danger',
                formData: req.body
            });
        }

        db.query(sql2, [Email, password], (err2, result2) => {
            if (err2) {
                console.error("Student login creation error:", err2);
                return res.render('studentRegister', { 
                    message: 'Login details could not be saved!', 
                    status: 'danger',
                    formData: req.body
                });
            }

            res.render('studentRegister', { 
                message: 'Student registered successfully!', 
                status: 'success' 
            });
        });
    });
});

app.post('/register-teacher', (req, res) => {
    const { tName, tSchool, Email, password } = req.body;

    const sql1 = 'INSERT INTO TeacherRegister (tName, tSchool, Email) VALUES (?, ?, ?)';
    const sql2 = 'INSERT INTO TeacherLogin (Email, tPassword) VALUES (?, ?)';

    db.query(sql1, [tName, tSchool, Email], (err1, result1) => {
        if (err1) {
            console.error("Teacher register error:", err1);
            return res.render('teacherRegister', { 
                message: 'Registration failed!', 
                status: 'danger',
                formData: req.body
            });
        }

        db.query(sql2, [Email, password], (err2, result2) => {
            if (err2) {
                console.error("Teacher login creation error:", err2);
                return res.render('teacherRegister', { 
                    message: 'Login details could not be saved!', 
                    status: 'danger',
                    formData: req.body
                });
            }

            res.render('teacherRegister', { 
                message: 'Teacher registered successfully!', 
                status: 'success' 
            });
        });
    });
});

// Login handler
app.post('/login', (req, res) => {
    const { Email, password, role } = req.body;
    
    if (!role) {
        return res.render('login', { 
            message: 'Please select a role!', 
            status: 'warning',
            formData: req.body
        });
    }

    if (role === 'student') {
        const sql = 'SELECT * FROM StudentLogin WHERE Email = ? AND stuPassword = ?';
        db.query(sql, [Email, password], (err, result) => {
            if (err) {
                console.error("Student login error:", err);
                return res.render('login', { 
                    message: 'Server error!', 
                    status: 'danger',
                    formData: req.body
                });
            }

            if (result.length > 0) {
                req.session.userType = 'student';
                req.session.userEmail = Email;
                req.session.save(err => {
                    if (err) {
                        console.error("Session save error:", err);
                        return res.render('login', { 
                            message: 'Session error!', 
                            status: 'danger',
                            formData: req.body
                        });
                    }
                    return res.redirect('/home-student');
                });
            } else {
                return res.render('login', { 
                    message: 'Invalid student credentials!', 
                    status: 'danger',
                    formData: req.body
                });
            }
        });
    } 
    else if (role === 'teacher') {
        const sql = 'SELECT * FROM TeacherLogin WHERE Email = ? AND tPassword = ?';
        db.query(sql, [Email, password], (err, result) => {
            if (err) {
                console.error("Teacher login error:", err);
                return res.render('login', { 
                    message: 'Server error!', 
                    status: 'danger',
                    formData: req.body
                });
            }

            if (result.length > 0) {
                req.session.userType = 'teacher';
                req.session.userEmail = Email;
                req.session.save(err => {
                    if (err) {
                        console.error("Session save error:", err);
                        return res.render('login', { 
                            message: 'Session error!', 
                            status: 'danger',
                            formData: req.body
                        });
                    }
                    return res.redirect('/home-teacher');
                });
            } else {
                return res.render('login', { 
                    message: 'Invalid teacher credentials!', 
                    status: 'danger',
                    formData: req.body
                });
            }
        });
    } 
    else {
        return res.render('login', { 
            message: 'Invalid role selected!', 
            status: 'warning',
            formData: req.body
        });
    }
});

// Password reset handler
app.post('/reset-password', (req, res) => {
    const { Email, newPassword } = req.body;
    
    // Try student first
    const sqlStudent = 'UPDATE StudentLogin SET stuPassword = ? WHERE Email = ?';
    db.query(sqlStudent, [newPassword, Email], (err, result) => {
        if (err) {
            console.error("Student password reset error:", err);
            return res.render('resetPassword', { 
                message: 'Error occurred!', 
                status: 'danger',
                formData: req.body
            });
        }

        if (result.affectedRows > 0) {
            return res.render('resetPassword', { 
                message: 'Password updated successfully (Student)!', 
                status: 'success' 
            });
        }

        // Try teacher if student not found
        const sqlTeacher = 'UPDATE TeacherLogin SET tPassword = ? WHERE Email = ?';
        db.query(sqlTeacher, [newPassword, Email], (err2, result2) => {
            if (err2) {
                console.error("Teacher password reset error:", err2);
                return res.render('resetPassword', { 
                    message: 'Error occurred!', 
                    status: 'danger',
                    formData: req.body
                });
            }

            if (result2.affectedRows > 0) {
                return res.render('resetPassword', { 
                    message: 'Password updated successfully (Teacher)!', 
                    status: 'success' 
                });
            }

            res.render('resetPassword', { 
                message: 'Email not found!', 
                status: 'danger',
                formData: req.body
            });
        });
    });
});

app.get('/course-som', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('som', { session: req.session }); // <-- pass session
});

app.get('/course-sol', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sol', { session: req.session }); // <-- pass session
});
app.get('/course-soet', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('soet', { session: req.session }); // <-- pass session
});
app.get('/course-sscs', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sscs', { session: req.session }); // <-- pass session
});

app.get('/course-sscs-bca', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sscs-bca', { session: req.session }); // <-- pass session
});

app.get('/course-sscs-bsc', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sscs-bsc', { session: req.session }); // <-- pass session
});

app.get('/course-sscs-mca', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sscs-mca', { session: req.session }); // <-- pass session
});

app.get('/course-sscs-msc', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sscs-msc', { session: req.session }); // <-- pass session
});

app.get('/course-som-bba', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('som-bba', { session: req.session }); // <-- pass session
});

app.get('/course-som-bcom', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('som-bcom', { session: req.session }); // <-- pass session
});

app.get('/course-som-mba', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('som-mba', { session: req.session }); // <-- pass session
});

app.get('/course-som-mcom', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('som-mcom', { session: req.session }); // <-- pass session
});

app.get('/course-sol-bballb', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sol-bballb', { session: req.session }); // <-- pass session
});

app.get('/course-sol-ballb', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sol-ballb', { session: req.session }); // <-- pass session
});

app.get('/course-sol-llb', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sol-llb', { session: req.session }); // <-- pass session
});

app.get('/course-sol-llm', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('sol-llm', { session: req.session }); // <-- pass session
});

app.get('/course-soet-btech-coe', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('soet-btechCOE', { session: req.session }); // <-- pass session
});

app.get('/course-soet-btech-ece', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('soet-btechECE', { session: req.session }); // <-- pass session
});

app.get('/course-soet-btech-me', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('soet-btechME', { session: req.session }); // <-- pass session
});

app.get('/course-soet-btech-cs', (req, res) => {
    if (!req.session.userType || (req.session.userType !== 'student' && req.session.userType !== 'teacher')) {
        return res.redirect('/login');
    }
    res.render('soet-btechCS', { session: req.session }); // <-- pass session
});


// app.get('/semester/:school/:branch/:semesterNumber', (req, res) => {
//     const { school, branch, semesterNumber } = req.params;

//     const query = `
//         SELECT pYear, pSubject, pFile
//         FROM PaperRecords 
//         WHERE pSchool = ? AND pBranch = ? AND pSemester = ?
//         ORDER BY uploadDate DESC
//     `;

//     db.query(query, [school.toUpperCase(), branch.toUpperCase(), semesterNumber], (err, results) => {
//         if (err) {
//             console.error('❌ DB Error:', err);
//             return res.status(500).send("Internal Server Error");
//         }

//         console.log("SESSION:", req.session);

//         res.render('semesterDashboard', {
//             school: school.toUpperCase(),
//             branch: branch.toUpperCase(),
//             semesterNumber,
//             papers: results,
//             successMessage: req.flash('success'),
//             // successMessage,
//             session: req.session
//         });
//     });
// });




  function fetchPapersFromDatabase(school, branch, semester) {
    return new Promise((resolve, reject) => {
        // SQL query to fetch papers for the given school, branch, and semester
        const query = `
            SELECT pSubject, pYear, pFile
            FROM PaperRecords
            WHERE pSchool = ? AND pBranch = ? AND pSemester = ?
            ORDER BY pYear DESC;`;

        // Execute the query
        db.query(query, [school, branch, semester], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

app.get('/semester/:school/:branch/:semesterNumber', (req, res) => {
    const { school, branch, semesterNumber } = req.params;

    // Fetch papers from the database
    fetchPapersFromDatabase(school, branch, semesterNumber)
        .then((papers) => {
            // Group papers by year
            const groupedPapers = papers.reduce((acc, paper) => {
                const year = paper.pYear;
                if (!acc[year]) {
                    acc[year] = []; // Initialize as an array if not already present
                }
                acc[year].push(paper);
                return acc;
            }, {});

            // Render the page with grouped papers
            res.render('semesterDashboard', {
                school: school.toUpperCase(),
                branch: branch.toUpperCase(),
                semesterNumber,
                papers: groupedPapers,
                successMessage: req.flash('success'),
                session: req.session
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error fetching papers from the database');
        });
});

app.get('/semesterDashboard/:school/:branch/:semesterNumber', (req, res) => {
    const { school, branch, semesterNumber } = req.params;
    res.render('semesterDashboard', { school, branch, semesterNumber,successMessage: req.flash('success'), });
  });

// app.get('/semester/:school/:branch/:semester', (req, res) => {
//     const { school, branch, semester } = req.params;

//     // Fetch papers from the database
//     fetchPapersFromDatabase(school, branch, semester)
//         .then((papers) => {
//             // Group papers by year
//             const groupedPapers = papers.reduce((acc, paper) => {
//                 const year = paper.pYear;
//                 if (!acc[year]) {
//                     acc[year] = []; // Initialize as an array if not already present
//                 }
//                 acc[year].push(paper);
//                 return acc;
//             }, {});

//             console.log(groupedPapers); // Log the grouped papers for debugging
            
//             // Render the page with grouped papers
//             res.render('semesterDashboard', {
//                 school,
//                 branch,
//                 papers: groupedPapers,
//                 semesterNumber: semester,
//                 session: req.session
//             });
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(500).send('Error fetching papers from the database');
//         });
// });




// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});