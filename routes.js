const path = require('path');
function routes(app, db, accounts, contactList) {
    // 1. Configure multer once at the top
    const multer = require('multer');
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            // Handle both CSV and other files
            if (file.mimetype === 'text/csv') {
                if (!file.originalname.match(/\.(csv)$/)) {
                    return cb(new Error('Please upload a CSV file'));
                }
            }
            cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));}
    });

    const upload = multer({ 
        storage,
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'text/csv' || file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type! Please upload a CSV or PDF file.'), false);
            }
        }
    });

    // 1. Authentication Routes
    app.post("/register", async (req, res) => {
        try {
            const { fname, cname, email, password, userType, secretKey } = req.body;

            // Validate admin registration
            if (userType === "Admin" && secretKey !== "#$dk61918#") {
                return res.status(400).json({ status: "error", message: "Invalid Admin" });
            }

            // Store user data (will be replaced with MongoDB)
            const userData = {
                fname, cname, email, password, userType,
                createdAt: new Date()
            };

            res.json({ status: "ok", message: "Registration Successful" });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    app.post("/login-user", async (req, res) => {
        try {
            const { cname, email, password } = req.body;
            
            // In production, verify against database
            const token = "Praveen"; // Replace with JWT
            
            res.json({
                status: "ok",
                data: token
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    app.post("/admin-login", async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // In production, verify admin credentials
            const token = "dummy-admin-token"; // Replace with JWT
            
            res.json({
                status: "ok",
                data: token
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    app.post("/userData", async (req, res) => {
        try {
            const { token } = req.body;
            
            // In production, verify token and get user data
            const userData = {
                fname: "Test User",
                email: "test@example.com",
                userType: "User"
            };
            
            res.json({
                data: userData
            });
        } catch (error) {
            res.status(500).json({ data: "token expired" });
        }
    });

    // 2. Clinical Trial Data Upload
    app.post("/upload-clinicaltraildata", upload.single('file'), async (req, res) => {
        try {
            if (!req.file) {
                throw new Error('Please upload a CSV file');
            }
    
            const { 
                manufacturerName, 
                drugName, 
                storageTemperature,
                drugDescription,
                commonSideEffect
            } = req.body;
    
            // Check if any required field is missing
            if (!manufacturerName || !drugName || !storageTemperature || !drugDescription || !commonSideEffect) {
                throw new Error('All fields must be provided');
            }
    
            // Create drug record in blockchain
            const result = await contactList.methods.createContact(
                manufacturerName,    //
                drugName,            // 
                storageTemperature,  // 
                drugDescription      // 
            ).send({
                from: accounts[0],
                gas: 3000000
            });
            
            console.log("Transaction Hash:", result.transactionHash);  // For debugging
    
            // Store in MongoDB with transaction hash
            const clinicalData = {
                manufacturerName,
                drugName,
                storageTemperature,
                drugDescription,
                commonSideEffect,
                csvFilePath: req.file.path,
                transactionHash: result.transactionHash,   // Include the hash here
                status: 'pending',
                createdAt: new Date()
            };
            console.log("Creating record on blockchain...");
console.log("Calling createContact with:", manufacturerName, drugName, drugDescription, commonSideEffect);
console.log("Using Ethereum account:", accounts[0]);

    
            await db.collection('clinicalTrials').insertOne(clinicalData);
    
            res.json({
                status: "ok",
                message: "Clinical trial data uploaded successfully",
                transactionHash: result.transactionHash
            });
        } catch (error) {
            console.error('Upload error:', error); // Log the error
            res.status(500).json({ 
                status: "error", 
                message: error.message 
            });
        }
    });
    
    

    // 3. Public Drug Search Route
    app.get("/drugs", async (req, res) => {
        try {
            const count = await contactList.methods.count().call();
            let drugs = [];

            for (let i = 1; i <= count; i++) {
                const drug = await contactList.methods.contacts(i).call();
                drugs.push({
                    id: i,
                    manufacturerName: drug.Manufacturename,
                    drugName: drug.Drugname,
                    composition: drug.Composition,
                    targetCondition: drug.Targetedmedicalcondition
                });
            }

            res.json({ status: "ok", data: drugs });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    // 4. General File Upload
    app.post('/upload-file', upload.single('file'), (req, res) => {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }
            res.json({ 
                status: "ok", 
                message: "File uploaded successfully",
                path: req.file.path
            });
        } catch (error) {
            res.status(500).json({ 
                status: "error", 
                message: error.message 
            });
        }
    });

    // 5. Contact List Route
    app.get('/contacts', async (request, response) => {
        try {
            let cache = [];
            
            const COUNTER = await contactList.methods.count().call();
            console.log('Total contacts:', COUNTER);

            for (let i = 1; i <= COUNTER; i++) {
                try {
                    const contact = await contactList.methods.contacts(i).call();
                    cache.push({
                        id: i,
                        manufacturerName: contact.Manufacturename,
                        drugName: contact.Drugname,
                        composition: contact.Composition,
                        targetCondition: contact.Targetedmedicalcondition
                    });
                } catch (error) {
                    console.error(error)
                }
            }

            response.json({
                success: true,
                contacts: cache
            });
        } catch (error) {
            console.error('Error in /contacts:', error);
            response.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Get Clinical Trial Data
    app.get("/getClinicalTrialData/:drugName", async (req, res) => {
        try {
            const { drugName } = req.params;
            // Fetch from MongoDB
            const clinicalData = await db.findOne({ drugName });
            
            res.json({
                status: "ok",
                data: clinicalData
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    // Update/Reject Certificate
    app.post("/update-reject-certificate", async (req, res) => {
        try {
            const { 
                manufacturerName, 
                drugName, 
                updatereject, 
                updatereason, 
                rejectreason 
            } = req.body;

            // Update in MongoDB
            const result = await db.collection('clinicalTrials').updateOne(
                { manufacturerName, drugName },
                { 
                    $set: { 
                        status: updatereject ? 'update_required' : 'rejected',
                        updateReason: updatereason,
                        rejectReason: rejectreason,
                        updatedAt: new Date()
                    }
                }
            );

            if (result.modifiedCount === 0) {
                throw new Error('Application not found');
            }

            res.json({
                status: "ok",
                message: updatereject ? "Update requested" : "Application rejected"
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    // Get Applications
    app.get("/getApplication", async (req, res) => {
        try {
            const applications = await db.collection("clinicalTrials").find({}).toArray();  
            res.json({
                status: "ok",
                data: applications
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });
    

    // Get Drug Details
    app.get("/getDrugDetails/:drugName", async (req, res) => {
        try {
            const { drugName } = req.params;
    
            // Get the 'clinicalTrials' collection from the database
            const collection = db.collection("clinicalTrials");
    
            // Fetch drug details from MongoDB
            const drugDetails = await collection.findOne({ drugName: drugName });
    
            if (!drugDetails) {
                return res.status(404).json({ status: "error", message: "Drug not found" });
            }
    
            res.json({
                status: "ok",
                data: drugDetails
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });
    

    // Get Application Status
    app.get("/applicationstatus", async (req, res) => {
        try {
            const { drugName } = req.query;
            // Fetch application status from MongoDB
            const status = await db.findOne({ drugName });
            
            res.json(status || []);
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    app.get("/application-status/:manufacturerName", async (req, res) => {
        try {
            const { manufacturerName } = req.params;
            
            const applications = await db.collection('clinicalTrials')
                .find({ manufacturerName })
                .toArray();

            res.json({
                status: "ok",
                applications
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });
}

module.exports = routes;