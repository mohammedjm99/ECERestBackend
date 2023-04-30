const router = require('express').Router();
const Table = require('../models/Table');
const { verifyTokenAndAdmin, verifyTokenAndCashier,verifyTokenAndManager } = require('../controllers/verify');
const crypto = require('crypto');

router.get('/',verifyTokenAndManager, async (req, res) => {
    try {
        const tables = await Table.find({ number: { $ne: 0 } });
        res.status(200).json({tables,rule:req.user.rule});
    } catch (e) {
        res.status(400).json(e.message);
    }
});

router.get('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);
        res.status(200).json(table);
    } catch (e) {
        res.status(400).json(e.message);
    }
});

router.post('/',verifyTokenAndAdmin, async (req, res) => {
    const { number, distance } = req.body;
    const newTable = new Table({ number, distance, secret: crypto.randomBytes(5).toString('hex') });
    try {
        await newTable.save();
        res.status(200).json(newTable);
    } catch (e) {
        if (e.message.includes('E11000')) return res.status(400).json('Table Number already exists.');
        res.status(400).json('internal server error');
    }
});

router.put('/qr/:id',verifyTokenAndCashier, async (req, res) => {
    try {
        const updatedTable = await Table.findByIdAndUpdate(req.params.id, {
            $set: {
                secret: crypto.randomBytes(5).toString('hex')
            }
        }, { new: true });
        if (!updatedTable) return res.status(400).json('No table found to update...');
        res.status(200).json(updatedTable);
    } catch (e) {
        res.status(400).json('Cant update table...');
    }
});

router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedTable = await Table.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!updatedTable) return res.status(400).json('No table found to update...');
        res.status(200).json(updatedTable);
    } catch (e) {
        if (e.message.includes('E11000')) return res.status(400).json(`Table Number already exists, please go to table number ${req.body.number} edit page to edit table`);
        res.status(400).json('Cant update table...');
    }
});

router.delete('/:id',verifyTokenAndAdmin, async (req, res) => {
    try {
        const deletedTable = await Table.findByIdAndDelete(req.params.id);
        if (!deletedTable) return res.status(400).json('No table found to delete...');
        res.status(200).json(deletedTable);
    } catch (e) {
        res.status(400).json('Table not deleted...');
    }
})

module.exports = router;