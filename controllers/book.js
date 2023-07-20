const Book = require('../models/Book')
const fs = require('fs')

require('dotenv').config()

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    
    book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
}

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                    if (req.file){
                        const filename = book.imageUrl.split('/images/')[1]
                        fs.unlink(`images/${filename}`, (err) => {if (err) console.log("Un fichier d'image n'a pas était supprimé")})
                    }
                    Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Livre modifié!'}))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
}

exports.deleteBook = (req, res, next) => {
   Book.findOne({ _id: req.params.id})
       .then(book => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
               const filename = book.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Book.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
}

exports.getAllBooks = (req, res, next) => {
  Book.find()
  .then(books => res.status(200).json(books))
  .catch(error => res.status(400).json({ error }))
}

exports.getBestRatingsBooks = (req, res, next) => {
    let bestRatings = []

    Book.find()
    .then(books => {
        books.forEach(item => {
            if (bestRatings.length < 3){
                bestRatings.push(item)
            } else {
                bestRatings.sort((a, b) => a.averageRating - b.averageRating)
                const myindex = bestRatings.findIndex((element) => element.averageRating < item.averageRating)
                if (myindex >= 0){
                    bestRatings.splice(myindex,1,item)
                }
            }
        })
        res.status(200).json(bestRatings)
    })
    .catch(error => res.status(400).json({ error }))
}

exports.rateBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
    .then(book => {
        let tabRating = book.ratings
        delete book.ratings
        delete book.averageRating

        const checkRate = () => {
            let check = false
            let acc = 0
            tabRating.map((item) => {
                if (item.userId === req.auth.userId) check = !check
                acc += item.grade
            })

            tabRating.push({
                userId: req.body.userId,
                grade: req.body.rating
            })

            acc += req.body.rating

            return [check,acc]
        }

        const [check,acc] = checkRate()

        try {
            if (check) throw "L'utilisateur ne peux donner son avis qu'une seul fois"

            const newAverageRating = Math.floor( acc / tabRating.length )

            const newBook = {
                ...book._doc,
                _id: req.params.id,
                ratings: tabRating,
                averageRating: newAverageRating
            }
            
            Book.updateOne({ _id: req.params.id}, { ...newBook})
            .then(() => res.status(200).json({ ...newBook }))
            .catch(error => res.status(401).json({ error })) 

        } catch (error) {
            res.status(401).json({ error })
        }
    })
    .catch(error => res.status(400).json({ error }))
}