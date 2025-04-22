// public/uploads/upload.js  ❌ Wrong place
// Move it to: routes/upload.js ✅

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../database/db'); // ✅ fix path to DB

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Upload route
router.post('/uploadPaper', upload.single('paperFile'), (req, res) => {
  const { school, branch, semester, subject, year } = req.body;
  const fileName = req.file.filename;
  const uploader = req.session.username || 'unknown';
  const uploadDate = new Date();

  const sql = `
    INSERT INTO PaperRecords (pSchool, pBranch, pSemester, pSubject, pYear, pFile, uploadedBy, uploadDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [school, branch, semester, subject, year, fileName, uploader, uploadDate], (err, result) => {
    if (err) {
      console.error('Upload error:', err.sqlMessage || err.message);
      return res.status(500).send('Database error: ' + err.sqlMessage);
    }
    req.flash('success', 'Paper uploaded successfully');
    res.redirect(`/semester/${school}/${branch}/${semester}`);
  });
  
});

module.exports = router;
