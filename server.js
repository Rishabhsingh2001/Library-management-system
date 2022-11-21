if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const books = [{
  bookName: "Introduction to HTML",
  bookAuthor: "ABC",
  bookPages: 200,
  bookPrice: 240,
  bookState: "Available"
},
{
  bookName: "Learning CSS",
  bookAuthor: "DEF",
  bookPages: 200,
  bookPrice: 240,
  bookState: "Available"
},
{
  bookName: "Python",
  bookAuthor: "GHI",
  bookPages: 200,
  bookPrice: 240,
  bookState: "Available"
}
]
const app = express()

const users = []


app.set('view-engine','ejs')
app.use(express.urlencoded({ extended : false }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.static('public'))


app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name : req.user.name,
    data: books})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })

  app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
  });


  app.post("/insert", (req, res) => {
    const inputBookName = req.body.bookName
    const inputBookAuthor = req.body.bookAuthor
    const inputBookPages = req.body.bookPages
  
    books.push({
      bookName: inputBookName,
      bookAuthor: inputBookAuthor,
      bookPages: inputBookPages,
      bookState: "Available"
    })
  
    res.render("index", {
      data: books
    })
  })

  app.post('/issue', (req, res) => {
    var requestedBookName = req.body.bookName;
    books.forEach(book => {
      if (book.bookName == requestedBookName) {
        book.bookState = "Issued";
      }
    })
    res.render("index", {
      data: books
    })
  })
  
  app.post('/return', (req, res) => {
    var requestedBookName = req.body.bookName;
    books.forEach(book => {
      if (book.bookName == requestedBookName) {
        book.bookState = "Available";
      }
    })
    res.render("index", {
      data: books
    })
  })
  
  app.post('/delete', (req, res) => {
    var requestedBookName = req.body.bookName;
    var j = 0;
    books.forEach(book => {
      j = j + 1;
      if (book.bookName == requestedBookName) {
        books.splice((j - 1), 1)
      }
    })
    res.render("index", {
      data: books
    })
  })




  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }

  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }



app.listen(3000)