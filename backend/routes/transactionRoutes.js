const express = require('express');
const { createTransaction, getTransactionSummary, getTransactions } = require('../controllers/transactionController');

const router = express.Router();

router.get('/summary', getTransactionSummary);
router.get('/', getTransactions);
router.post('/', createTransaction);

module.exports = router;
