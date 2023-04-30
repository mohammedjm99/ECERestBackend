const Manager = require('../models/Manager');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyTokenAndAdmin } = require('../controllers/verify');

router.get('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const managers = await Manager.find().select('-password');
        res.status(200).json(managers);
    } catch (e) {
        res.status(400).json("can't get managers");
    }
});

router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.id);
        if(manager.rule==='admin') return res.status(400).json("can't delete admin");
        const deletedManager = await Manager.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedManager._id);
    } catch (e) {
        res.status(400).json("can't delete manager");
    }
})

router.post('/', verifyTokenAndAdmin, async (req, res) => {
    const { username, password, rule } = req.body;
    if (!rule || !username || !password) return res.status(400).json('please fill all inputs...');
    try {
        if (rule === 'chief' || rule === 'cashier') {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newManager = new Manager({
                username,
                password: hashedPassword,
                rule
            });
            await newManager.save();
            const sendData = {
                _id: newManager._doc._id,
                username: newManager._doc.username,
                rule: newManager._doc.rule
            }
            res.status(200).json(sendData);
        } else {
            return res.status(400).json("invalid role.");
        }
    } catch (e) {
        if (e.message.includes('E11000')) return res.status(400).json('Username already exists.');
        else res.status(400).json("Can't add manager.");
    }

});

router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    const { username, password, rule } = req.body
    try {
        if (rule === 'chief' || rule === 'cashier') {
            if (password === 'fakeOne!!!!!!') {
                const updatedManager = await Manager.findByIdAndUpdate(req.params.id, {
                    $set: {
                        username,
                        rule
                    }
                }, { new: true });
                const sendData = {
                    _id: updatedManager._doc._id,
                    username: updatedManager._doc.username,
                    rule: updatedManager._doc.rule
                }
                res.status(200).json(sendData);
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const updatedManager = await Manager.findByIdAndUpdate(req.params.id, {
                    $set: {
                        username,
                        password: hashedPassword,
                        rule
                    }
                }, { new: true });
                const sendData = {
                    _id: updatedManager._doc._id,
                    username: updatedManager._doc.username,
                    rule: updatedManager._doc.rule
                }
                res.status(200).json(sendData);
            }
        } else {
            res.status(400).json("invalid role.");
        }
    } catch (e) {
        if (e.code === 11000) {
            return res.status(400).json("username already exists.")
        }
        res.status(400).json("internal server error");
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const manager = await Manager.findOne({ username });
        if (!manager) return res.status(400).json('Invalid username or password');
        const checkPassword = await bcrypt.compare(password, manager.password);
        if (!checkPassword) return res.status(400).json('Invalid username or password');
        const token = jwt.sign({ _id: manager._id, rule: manager.rule }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json(token);
    } catch (e) {
        res.status(400).json("Can't login.")
    }
})

module.exports = router;