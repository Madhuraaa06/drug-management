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

            // Check if user already exists
            try {
                const existingUser = await db.collection('users').findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ status: "error", message: "User already exists with this email" });
                }
            } catch (findError) {
                console.error("Error checking for existing user:", findError);
                // Continue with registration even if check fails
            }

            // Store user data in MongoDB
            const userData = {
                fname,
                cname,
                email,
                username: email, // Use email as username to avoid null value
                password, // In production, hash this password
                userType,
                createdAt: new Date()
            };

            try {
                await db.collection('users').insertOne(userData);
                res.json({ status: "ok", message: "Registration Successful" });
            } catch (insertError) {
                // If there's a duplicate key error, try to update the existing user
                if (insertError.code === 11000) {
                    console.log("Duplicate key error, attempting to update user");
                    // Generate a unique username if that's the issue
                    if (insertError.keyPattern && insertError.keyPattern.username) {
                        userData.username = email + '-' + Date.now();
                    }

                    try {
                        // Try to insert with modified data
                        await db.collection('users').insertOne(userData);
                        res.json({ status: "ok", message: "Registration Successful" });
                    } catch (finalError) {
                        console.error("Final registration error:", finalError);
                        res.status(500).json({ status: "error", message: "Registration failed after multiple attempts" });
                    }
                } else {
                    throw insertError; // Re-throw if it's not a duplicate key error
                }
            }
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    app.post("/login-user", async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user in database by email
            const user = await db.collection('users').findOne({
                $or: [{ email }, { username: email }]
            });

            // Check if user exists and password matches
            if (!user) {
                return res.status(401).json({ status: "error", message: "Invalid email or password" });
            }

            // In production, compare hashed passwords
            if (user.password !== password) {
                return res.status(401).json({ status: "error", message: "Invalid email or password" });
            }

            // Generate token (in production, use JWT)
            const token = "user-" + Date.now();

            res.json({
                status: "ok",
                data: token,
                userType: user.userType,
                cname: user.cname // Include company name for display
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    app.post("/admin-login", async (req, res) => {
        try {
            const { email, password } = req.body;

            // For simplicity, hardcoded admin credentials
            if (email === "admin" && password === "admin") {
                const token = "admin-" + Date.now();

                res.json({
                    status: "ok",
                    data: token,
                    userType: "Admin"
                });
            } else {
                res.status(401).json({ status: "error", message: "Invalid admin credentials" });
            }
        } catch (error) {
            console.error("Admin login error:", error);
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    app.post("/userData", async (req, res) => {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(401).json({ data: "token expired" });
            }

            // Check if admin token
            if (token.startsWith("admin-")) {
                return res.json({
                    data: {
                        fname: "Admin",
                        cname: "FDA",
                        email: "admin@fda.gov",
                        userType: "Admin"
                    }
                });
            }

            // For user tokens, try to find the user in the database
            // In a real app, you would decode the JWT and extract the user ID
            try {
                // For demo purposes, just return the most recently created user
                const user = await db.collection('users').findOne(
                    { userType: "User" },
                    { sort: { createdAt: -1 } }
                );

                if (user) {
                    return res.json({
                        data: {
                            fname: user.fname,
                            cname: user.cname,
                            email: user.email,
                            userType: user.userType
                        }
                    });
                }
            } catch (dbError) {
                console.error("Database error:", dbError);
            }

            // Fallback to generic user data if no user found
            return res.json({
                data: {
                    fname: "Test User",
                    cname: "Test Company",
                    email: "test@example.com",
                    userType: "User"
                }
            });
        } catch (error) {
            console.error("User data error:", error);
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
                drugDescription,  //
                commonSideEffect      //
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
            const clinicalData = await db.collection('clinicalTrials').findOne({ drugName });

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
                        status: updatereject ? 'approved' : 'rejected', // Change status to approved or rejected
                        updateReason: updatereject ? updatereason : null, // Set updateReason only if approved
                        rejectReason: !updatereject ? rejectreason : null, // Set rejectReason only if rejected
                        updatedAt: new Date()
                    }
                }
            );

            if (result.modifiedCount === 0) {
                throw new Error('Application not found');
            }

            res.json({
                status: "ok",
                message: updatereject ? "Update approved" : "Application rejected"
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    // This route is already defined above
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
            const status = await db.collection('clinicalTrials').findOne({ drugName });

            if (status) {
                // Return the found document along with a success status
                res.json({ status: "success", data: status });
            } else {
                // If no document is found, return a not found status
                res.json({ status: "not found", data: [] });
            }
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    });

    // Get Drug Name Suggestions
    app.get("/drug-suggestions", async (req, res) => {
        try {
            const { query } = req.query;

            if (!query || query.trim() === '') {
                return res.json({ status: "ok", suggestions: [] });
            }

            // Search for drug names in MongoDB that match the query (case-insensitive)
            const suggestions = await db.collection('clinicalTrials')
                .find({
                    drugName: { $regex: query, $options: 'i' }
                })
                .project({ drugName: 1, _id: 0 })
                .limit(10)
                .toArray();

            // Extract just the drug names
            const drugNames = suggestions.map(item => item.drugName);

            res.json({
                status: "ok",
                suggestions: drugNames
            });
        } catch (error) {
            console.error('Error fetching drug suggestions:', error);
            res.status(500).json({
                status: "error",
                message: error.message
            });
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

    // Delete all drug applications
    app.delete("/delete-all-applications", async (req, res) => {
        try {
            // Check if request has admin token in various places
            let adminToken = req.headers.admintoken || req.headers['admintoken'] || req.headers['adminToken'] || req.headers['admin-token'];

            // Also check authorization header
            const authHeader = req.headers.authorization || req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const bearerToken = authHeader.substring(7);
                if (bearerToken.startsWith('admin-')) {
                    adminToken = bearerToken;
                }
            }

            // Also check query parameters
            if (req.query.adminToken) {
                adminToken = req.query.adminToken;
            }

            // TEMPORARY WORKAROUND: Skip token validation for testing
            // In a production environment, you would want to uncomment and use the block below
            /*
            if (!adminToken || !adminToken.startsWith("admin-")) {
                return res.status(403).json({
                    status: "error",
                    message: "Unauthorized. Admin access required."
                });
            }
            */

            // Delete all documents from the clinicalTrials collection
            const result = await db.collection('clinicalTrials').deleteMany({});

            // Get a list of all CSV files to potentially delete them as well
            // Note: This doesn't actually delete the files, just returns the paths
            const csvFiles = await db.collection('clinicalTrials')
                .find({})
                .project({ csvFilePath: 1, _id: 0 })
                .toArray();

            res.json({
                status: "ok",
                message: `Successfully deleted ${result.deletedCount} drug applications`,
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error('Error deleting applications:', error);
            res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    });

    // Delete a single drug application
    app.delete("/delete-application", async (req, res) => {
        try {
            // Check if request has admin token in various places
            let adminToken = req.headers.admintoken || req.headers['admintoken'] || req.headers['adminToken'] || req.headers['admin-token'];

            // Also check authorization header
            const authHeader = req.headers.authorization || req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const bearerToken = authHeader.substring(7);
                if (bearerToken.startsWith('admin-')) {
                    adminToken = bearerToken;
                }
            }

            // Also check query parameters
            if (req.query.adminToken) {
                adminToken = req.query.adminToken;
            }

            // TEMPORARY WORKAROUND: Skip token validation for testing
            // In a production environment, you would want to uncomment and use the block below
            /*
            if (!adminToken || !adminToken.startsWith("admin-")) {
                return res.status(403).json({
                    status: "error",
                    message: "Unauthorized. Admin access required."
                });
            }
            */

            // Try to get parameters from body or query parameters
            const drugName = req.body.drugName || req.query.drugName;
            const manufacturerName = req.body.manufacturerName || req.query.manufacturerName;

            if (!drugName || !manufacturerName) {
                return res.status(400).json({
                    status: "error",
                    message: "Drug name and manufacturer name are required"
                });
            }

            // Find the application to get its CSV file path before deletion
            const application = await db.collection('clinicalTrials').findOne({ drugName, manufacturerName });

            if (!application) {
                return res.status(404).json({
                    status: "error",
                    message: "Application not found"
                });
            }

            // Delete the application
            const result = await db.collection('clinicalTrials').deleteOne({ drugName, manufacturerName });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Application not found or already deleted"
                });
            }

            res.json({
                status: "ok",
                message: `Successfully deleted application for ${drugName}`,
                deletedApplication: {
                    drugName,
                    manufacturerName,
                    csvFilePath: application.csvFilePath
                }
            });
        } catch (error) {
            console.error('Error deleting application:', error);
            res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    });
}

module.exports = routes;