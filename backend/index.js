if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

var serveStatic = require('serve-static');

// Initializations
const app = express();
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
/* require('./database');
 */
// settings
app.set('port', process.env.PORT || 3000);

// middlewares
app.use(morgan('dev'));
app.use(cors());
const storage = multer.diskStorage({
	destination: path.join(__dirname, 'public/uploads'),
	filename(req, file, cb) {
		cb(null, new Date().getTime() + path.extname(file.originalname));
	}
});
app.use(multer({ storage }).single('image'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// routes
app.use('/', require('./routes/routes'));

// static files
//app.use(express.static(path.join(__dirname, 'public')));
app.use(serveStatic(path.join(__dirname, 'public')));
app.use(serveStatic(path.join(__dirname, 'public/uploads')));
//app.use(express.static(path.join(__dirname, 'public/uploads')));

// start the server
app.listen(app.get('port'), () => {
	console.log('Root directory: ' + process.cwd());
	console.log('Current folder: ' + path.join(__dirname));
	console.log(`Server is listening on: http://localhost:${app.get('port')}`);
});
