const dbconfig = require('../config/database');
const mysql = require('mysql2');
const con = mysql.createConnection(dbconfig.connection);
con.query('USE ' + dbconfig.database);
const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument({
	size: 'A6',
	margin: 20
});

module.exports = function(app, passport) {
	const jwt = require('jsonwebtoken');
	const JWT_SECRET = 'rrinventorycics';

	app.use((req, res, next)=>{
		res.locals.filterdata;
		next();
	})
	// LOGIN =========================
	// ===============================
	app.get('/', (req,res) =>{
        res.redirect('/login');
    });
	app.get('/login', function(req, res) {
		res.render(process.cwd() + '/pages/login', { message: req.flash('loginMessage') });
	});
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', 
            failureRedirect : '/login', 
            failureFlash : true 
		}),
        function(req, res) {
            console.log("someone logged in");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// FORGOT PW =======================
	// =================================
	app.get('/forgot', function(req, res) {
		res.render(process.cwd() + '/pages/forgot');
	});
	app.post('/forgot', function(req, res) {
		let email = req.body.email;
		if (email !== req.user.email){
			req.flash('loginMessage', 'Email not found')
			res.render(process.cwd() + '/pages/login', {
				data:result,
				user: req.user,
				message: req.flash('loginMessage')})
		} 
		else{
			const secret = JWT_SECRET + req.user.password;
			const payload = {
				email: req.user.email,
				id: req.user.id
			}
			const token = jwt.sign(payload, secret, {expiresIn: '10m'})
			const link = `http://localhost:3000/reset-password/${req.user.id}/${req.user}`
			console.log(link);
			req.flash('loginMessage', 'Password Reset Link has been sent to your email')
			res.render(process.cwd() + '/pages/login', {
				data:result,
				user: req.user,
				message: req.flash('loginMessage')})
		}
	});
	app.get('/reset-password/:id/:token', (req,res)=>{
		const {id, token} = req.params;

		if (id == req.user.id){
			res.send('Invalid ID.....')
			return
		}
		const secret = JWT_SECRET + req.user.password;
		try {
			const payload = jwt.verify(token, secret)
			res.render(process.cwd() + '/pages/reset', {
				email: req.user.email,
				message: req.flash('loginMessage')})
		} catch (err) {
			console.log(err)
		}
	});
	app.post('/reset-password/:id/:token', (req,res)=>{
		const {id, token} = req.params;
		let sql = ``;
	})

	// PAGE ROUTES =====================
	// =================================
	app.get('/profile', isLoggedIn, (req, res)=> {
		if (req.isAuthenticated() && (req.user.isAdmin === 1)) {
				res.redirect('/admin');
		}
		else if(req.isAuthenticated() && (req.user.isAdmin !== 1)) {
			res.redirect('/cashier');
		}
	});

	// ADMIN ROUTES =====================
	// ==================================
	app.get('/admin', isLoggedIn, (req,res)=>{
		let sql = "SELECT * FROM orders ORDER BY orderId DESC"
		con.query(sql, (err,result)=>{
			if(!err){
				res.render(process.cwd() + '/pages/admin/history', {
					data:result,
					user: req.user,
					message: req.flash('historyMessage')
				});
			}
			else{
				res.status(404).send(err);
			}
		});	
	});
	app.get('/admin/history', isLoggedIn, (req,res)=>{
		let sql = "SELECT * FROM orders ORDER BY orderId DESC"
		con.query(sql, (err,result)=>{
			if(!err){
				res.render(process.cwd() + '/pages/admin/history', {
					data:result, 
					user: req.user,
					message: req.flash('historyMessage')
				});
			}
			else{
				res.status(404).send(err);
			}
		});	
	});
	app.post('/history/save', isLoggedIn, (req,res)=>{
		let order = req.body.orderId;
		let status = req.body.stat;
		if (Array.isArray(order)== false && Array(order).length == 1){
			let sql = "UPDATE orders SET status = ? WHERE orderId = ?";
			con.query(sql, [status, order],(err,result)=>{
				if (!err&& (req.user.isAdmin === 1)){
					req.flash('historyMessage', 'Status Saved')
					res.redirect('/admin/history')
				}
				else{
					console.log(err);
					res.status(404).send(err);
				}
			});
		}
		else{
			order.forEach((product, index, arr) => {
				const s = status[index];
				let sql = "UPDATE orders SET status = ? WHERE orderId = ?";
				con.query(sql, [s, product],(err,result)=>{
					if (!err&& (req.user.isAdmin === 1)){
						console.log('Product Added');
					}
					else{
						console.log(err);
						res.status(404).send(err);
						
					}
				});
			})
			req.flash('historyMessage', 'Status Saved')
			res.redirect('/admin/history')
		}
	});
	app.get('/history/form', isLoggedIn,(req,res)=>{
		let sql = "SELECT * FROM stocks"
		let sql2 = "SELECT * FROM orders"
		con.query(sql, (err,result)=>{
			con.query(sql2, (err2,result2)=>{
				if(!err){
					res.render(process.cwd() + '/pages/admin/form', {data2:result2, data:result, user: req.user});
	
				}
				else{
					res.status(404).send(err, err2);
				}
			})
		});	
	});
	app.post('/history/form/confirm', isLoggedIn, (req,res)=>{
		let codes = req.body.pcode,
		quanti = req.body.qty, 
		price = req.body.price, 
		cust = req.body.orderedBy,
		stat = req.body.status, 
		oDate = req.body.orderDate + " " + new Date().getHours() + ":" + new Date().getMinutes(); 
		if (Array.isArray(codes)== false){
				let sql = `INSERT INTO orders (productCode, productName, unitPrice, quantity, totalPrice, customer, date, status, unit)
				SELECT ?, productName, unitPrice, ?, ?, ?, ?, ?, unit
				FROM stocks
				WHERE productCode = ?`
				con.query(sql,[codes, quanti, price, cust, oDate, stat, codes], (err,result)=>{
					if (!err){
						console.log(codes, quanti, price, cust, oDate, stat);
						req.flash('historyMessage', 'Order Created')
						res.redirect('/admin/history')
					}
					else{
						console.log(err);
						res.status(404).send(err);
					}
				})
		}
		else{
			codes.forEach((product, index, arr)=>{
				const q = quanti[index];
				const p = price[index];
				const s= stat[index];
				let sql = `INSERT INTO orders (productCode, productName, unitPrice, quantity, totalPrice, customer, date, status, unit)
				SELECT ?, productName, unitPrice, ?, ?, ?, ?, ?, unit
				FROM stocks
				WHERE productCode = ?`
				console.log(sql)
				con.query(sql,[product, q, p, cust, oDate, s, product], (err,result)=>{
					if (!err){
						console.log('Order Added');
					}
					else{
						console.log("two",err)
						res.send(err);
					}
				})
			})
			req.flash('historyMessage', 'Order Created')
		res.redirect('/admin/history')
		}
	});
	app.post('/history/form/confirmPrint', isLoggedIn, (req,res)=>{
		let codes = req.body.pcode,
		quanti = req.body.qty, 
		price = req.body.price, 
		cust = req.body.orderedBy,
		stat = req.body.status, 
		oDate = req.body.orderDate + " " + new Date().getHours() + ":" + new Date().getMinutes(); 
		if (Array.isArray(codes)== false){
				let sql = `INSERT INTO orders (productCode, productName, unitPrice, quantity, totalPrice, customer, date, status, unit)
				SELECT ?, productName, unitPrice, ?, ?, ?, ?, ?, unit
				FROM stocks
				WHERE productCode = ?`
				con.query(sql,[codes, quanti, price, cust, oDate, stat, codes], (err,result)=>{
					if (!err){
						//=======================SINGLE==============================
						//=====================================================
						doc.pipe(fs.createWriteStream(cust +" "+ req.body.orderDate + new Date().getMinutes() + '.pdf'))
						doc.font('Times-Roman', 16).text('R & R Merchandise', {align: 'center'})
							.font('Times-Roman', 12).text('Payment Receipt', {align: 'center'})
							.moveDown()
							.font('Courier' , 10).text('Customer: '+ cust, {align: 'left', continued: true})
							.text('Date: '+ req.body.orderDate, {align: 'right'})
							.moveDown()
							.font('Courier' , 10).text('-Product/s-', {align: 'left', continued: true})
							.text('Quantity ', {align: 'center', continued: true})
							.text('Sub-Total ', {align: 'right'})
							.moveDown()
							.font('Courier' , 10).text(''+ codes, {align: 'left', continued: true})
							.text(''+ quanti, {align: 'center', continued: true})
							.text(''+ price, {align: 'right'})
							.moveDown()
							.text('TOTAL:    '+ price, {align: 'right'})
							.moveDown()
							.moveDown()
							.text('Tel: Some Tel Number', {align: 'center'})
							.text('Email: Some email Address', {align: 'center'})
							.text('Address: Some Address', {align: 'center'});
						doc.end();
						setTimeout(function(){
							let data = fs.readFileSync(process.cwd()+ '\\' + cust +" "+ req.body.orderDate + new Date().getMinutes() + '.pdf');
							res.contentType("application/pdf");
							res.download(process.cwd()+ '\\' + cust +" "+ req.body.orderDate + new Date().getMinutes() + '.pdf', cust +" "+ req.body.orderDate + new Date().getMinutes() + '.pdf');
						},4000)
						req.flash('historyMessage', 'Order Created')
						res.redirect('/admin/history')
					}
					else{
						console.log(err);
						res.status(404).send(err);
					}
				})
		}
		else{
			codes.forEach((product, index, arr)=>{
				const q = quanti[index];
				const p = price[index];
				const s= stat[index];
				let sql = `INSERT INTO orders (productCode, productName, unitPrice, quantity, totalPrice, customer, date, status, unit)
				SELECT ?, productName, unitPrice, ?, ?, ?, ?, ?, unit
				FROM stocks
				WHERE productCode = ?`
				console.log(sql)
				con.query(sql,[product, q, p, cust, oDate, s, product], (err,result)=>{
					if (!err){
						console.log('Order Added');
					}
					else{
						console.log("two",err)
						res.send(err);
					}
				})
			})
			//=====================MULTIPLE=============================
			//=====================================================
			doc.pipe(fs.createWriteStream(cust +" "+ oDate + '.pdf'))
			req.flash('historyMessage', 'Order Created')
			res.redirect('/admin/history')
		}
	});

	app.get('/admin/stocks', isLoggedIn, (req,res)=>{
		let sql = "SELECT * FROM stocks ORDER BY stocksLeft ASC"
		con.query(sql, (err,result)=>{
			if(!err){
				res.render(process.cwd() + '/pages/admin/Stocks', {data: result, user: req.user});
			}
			else{
				res.status(404).send(err);
			}
		});	
	});

	//ADMIN RECEIVE==================================
	app.get('/admin/receive', isLoggedIn, (req,res)=>{
		let date = ""+ new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate() ;
		let sql = "SELECT * FROM receive WHERE DATE(date) = ?";
		con.query(sql,[date], (err,result)=>{
			if (!err&&(req.user.isAdmin === 1)){
				req.flash('dateMessage', date)
					res.render(process.cwd() + '/pages/admin/receive', {
						data: result, 
						user: req.user,
						fltrdate: req.flash('dateMessage'),
						message: req.flash('receiveMessage')
					});
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	//ADMIN RECEIVE EDIT==================================
	app.post('/receive/edit', isLoggedIn, (req,res)=>{
		let date = ""+ new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate() ;
		let sql = "SELECT * FROM receive WHERE DATE(date) = ?";
		con.query(sql,[date], (err,result)=>{
			if (!err){
				req.flash('dateMessage', "" + date)
					res.render(process.cwd() + '/pages/admin/editReceive', {
						data: result, 
						user: req.user,
						fltrdate: req.flash('dateMessage')
					});
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	app.post('/receive/edit/delete', isLoggedIn, (req,res)=>{
		let date = ""+ new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate() ;
		let sql = "DELETE FROM receive WHERE (DATE(date),productCode) = (?,?)";
		con.query(sql,[date, req.body.deleteProd], (err,result)=>{
			if (!err){
				req.flash('receiveMessage', 'Successfully deleted')
				res.redirect('/admin/receive')
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	app.post('/receive/edit/save', isLoggedIn, (req,res)=>{
		let date = ""+ new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate(),
		codes = req.body.code,  
		products = req.body.product,
		unit = req.body.unit,
		quantity = req.body.quantity,
		supply = req.body.supplier,
		ut = req.body.ut;
		if (Array.isArray(codes)== false && Array(codes).length == 1){
				let sql = `UPDATE receive
				SET productCode=?, productName=?, unitPrice=?, quantity=? ,supplier=?, unit=?
				WHERE DATE(date)=?`;
				con.query(sql,[codes, products, unit, quantity, date, supply, ut], (err,result)=>{
					if (!err){
						req.flash('receiveMessage', 'Successfully saved');
						res.redirect('/admin/receive');
					}
					else{
						res.status(500).json({error: err})
					}
				});
		}else {
			codes.forEach((product, index, arr)=>{
				const q = quantity[index];
				const p = products[index];
				const u = unit[index];
				const utp = ut[index];
				const s = supply[index];
				let sql = `UPDATE receive
							SET productCode='`+product+`', productName='`+p+`', unitPrice='`+u+`', quantity='`+q+`', supplier='`+s+`', unit='`+utp+`'
							WHERE DATE(date)='`+date+`' AND productCode='`+product+`'`;
				con.query(sql, (err,result)=>{
					if (!err){
						console.log('no err loop');
						return;
					}
					else{
						console.log('err lopp');
						return res.status(500).json({error: err});
					}
				});
			});
			req.flash('receiveMessage', 'Successfully saved');
			return res.redirect('/admin/receive');
		}
	});
	app.get('/nuke-receive', isLoggedIn, (req,res)=>{
		let date = ""+ new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate() ;
		let sql = "DELETE FROM receive WHERE DATE(date) = (?)";
		console.log(sql);
		con.query(sql,[date], (err,result)=>{
			if (!err){
				req.flash('receiveMessage', 'Successfully deleted')
				res.redirect('/admin/receive')
			}
			else{
				res.status(404).send(err);
			}
		});
	});

	//ADMIN RECEIVE ADD==================================
	app.post('/receive/add', isLoggedIn, (req,res)=>{
		let date = ""+ new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate();
		let sql = "SELECT * FROM receive WHERE date = ?";
		con.query(sql,[date], (err,result)=>{
			if (!err){
				req.flash('dateMessage', "" + date)
					res.render(process.cwd() + '/pages/admin/addReceive', {
						data: result, 
						user: req.user,
						fltrdate: req.flash('dateMessage')
					});
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	app.post('/receive/add/save', isLoggedIn, (req,res)=>{
		let date = ""+ new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate() + " " + new Date().getHours() + ":" + new Date().getMinutes() ,
		codes = req.body.code,
		products = req.body.product,
		unit = req.body.unit,
		quantity = req.body.quantity,
		supply = req.body.supplier,
		ut = req.body.ut;
		if (Array.isArray(codes)== false && Array(codes).length == 1){
			let sql = `INSERT INTO receive (
				productCode,
				productName, 
				unitPrice, 
				quantity, 
				date, supplier, unit
				) VALUES (
					?,?,?,?,?,?,?)`;
			con.query(sql,[codes, products, unit, quantity, date, supply, ut], (err,result)=>{
				if (!err){
					req.flash('receiveMessage', 'Successfully saved');
					res.redirect('/admin/receive');
				}
				else{
					res.status(404).send(err);
				}
			});
		}
		else {
			codes.forEach((product, index, arr)=>{
				let p = products[index];
				let u = unit[index];
				let q = quantity[index];
				let s = supply[index];
				let utp = ut[index];
				let sql = `INSERT INTO receive (
					productCode,
					productName, 
					unitPrice, 
					quantity, 
					date, supplier, unit
					) VALUES (
						?,?,?,?,?,?,?)`;
				con.query(sql, [product, p, u, q, date, s, utp], (err,result)=>{
					if (!err){
						console.log('product added');
					}
					else{
						return res.status(404).send(err);
					}
				});
			});
			req.flash('receiveMessage', 'Successfully saved');
			res.redirect('/admin/receive');
		}
	});

	//ADMIN USERS=========================================
	app.get('/admin/users', isLoggedIn, (req,res)=>{
		let sql = "SELECT * FROM users";
		con.query(sql, (err,result)=>{
			if (!err){
					res.render(process.cwd() + '/pages/admin/users', {
						data: result, 
						user: req.user,
						message: req.flash('userMessage')
					});
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	app.get('/users/delUsers', isLoggedIn, (req,res)=>{
		let sql = "SELECT * FROM users";
		con.query(sql, (err,result)=>{
			if (!err){
					res.render(process.cwd() + '/pages/admin/delUsers', {
						data: result, 
						user: req.user,
						message: req.flash('userMessage')
					});
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	app.post('/delUsers/del-data', isLoggedIn,(req,res)=>{
		let id = req.body.adminID;
		let sql = "DELETE FROM users WHERE id = ?";
		con.query(sql,[id], (err,result)=>{
			if (!err){
				req.flash('userMessage', 'Successfully deleted User');
				res.redirect('/admin/users')
			}
			else if (err){
				req.flash('userMessage', 'Failed to delete User');
				res.redirect('/admin/users')
			}
		});
	});
	

	// Register New User ==============================
	// =====================================
	app.get('/users/addUsers',  (req,res)=>{
		res.render(process.cwd() + '/pages/admin/addUsers', {
		user: req.user,
		message: req.flash('userMessage')
		});
	});
	
	app.post('/addUsers/send-data', passport.authenticate('local-signup', {
		successRedirect : '/admin/users', 
		failureRedirect : '/admin/users', 
		failureFlash : true,
	}));






	// FILTER ADMIN ROUTES =====================
	// =========================================
	app.post('/receive/filter', isLoggedIn, (req,res)=>{
		let date = req.body.date;
		filterdata = date;
		let sql = "SELECT * FROM receive WHERE DATE(date) = ?";
		con.query(sql,[date], (err,result)=>{
			if (!err){
				req.flash('dateMessage', date)
				res.render(process.cwd() + '/pages/admin/receiveFltr', {
					data: result, 
					user: req.user,
					message: req.flash('receiveMessage'),
					fltrdate: req.flash('dateMessage')
				});
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	app.post('/filter/edit', isLoggedIn, (req,res)=>{
		let date = filterdata;
		let sql = "SELECT * FROM receive WHERE DATE(date) = ?";
		con.query(sql,[date], (err,result)=>{
			if (!err){
				req.flash('dateMessage', "" + date)
					res.render(process.cwd() + '/pages/admin/editReceiveFltr', {
						data: result, 
						user: req.user,
						fltrdate: req.flash('dateMessage')
					});
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	app.post('/filter/edit/delete', isLoggedIn, (req,res)=>{
		let date =filterdata;
		let sql = "DELETE FROM receive WHERE (date,productCode) = (?,?)";
		con.query(sql,[date, req.body.deleteProd], (err,result)=>{
			if (!err){
				req.flash('receiveMessage', 'Successfully deleted')
				res.redirect('/receive/filter')
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	app.post('/filter/edit/save', isLoggedIn, (req,res)=>{
		let date=filterdata;
		codes = req.body.code,  
		products = req.body.product,
		unit = req.body.unit,
		quantity = req.body.quantity,
		supply = req.body.supplier,
		ut = req.body.ut;
		if (Array.isArray(codes)== false && Array(codes).length == 1){
				let sql = `UPDATE receive
				SET productCode=?, productName=?, unitPrice=?, quantity=? ,supplier=?, unit=?
				WHERE DATE(date)=?`;
				con.query(sql,[codes, products, unit, quantity, date, supply, ut], (err,result)=>{
					if (!err){
						req.flash('receiveMessage', 'Successfully saved');
						res.redirect('/admin/receive');
					}
					else{
						res.status(500).json({error: err})
					}
				});
		}else {
			codes.forEach((product, index, arr)=>{
				const q = quantity[index];
				const p = products[index];
				const u = unit[index];
				const utp = ut[index];
				const s = supply[index];
				let sql = `UPDATE receive
							SET productCode='`+product+`', productName='`+p+`', unitPrice='`+u+`', quantity='`+q+`', supplier='`+s+`', unit='`+utp+`'
							WHERE DATE(date)='`+date+`' AND productCode='`+product+`'`;
				con.query(sql, (err,result)=>{
					if (!err){
						console.log('no err loop');
						return;
					}
					else{
						console.log('err lopp');
						return res.status(500).json({error: err});
					}
				});
			});
			req.flash('receiveMessage', 'Successfully saved');
			return res.redirect('/admin/receive');
		}
	});
	app.get('/nuke-filter', isLoggedIn, (req,res)=>{
		let date=filterdata;
		let sql = "DELETE FROM receive WHERE DATE(date) =?";
		console.log(sql);
		con.query(sql,[date], (err,result)=>{
			if (!err){
				req.flash('receiveMessage', 'Successfully deleted')
				res.redirect('/admin/receive')
			}
			else{
				res.status(404).send(err);
			}
		});
	});


	app.post('/filter/add', isLoggedIn, (req,res)=>{
		let date=filterdata;
		let sql = "SELECT * FROM receive WHERE Date(date) = ?";
		con.query(sql,[date], (err,result)=>{
			if (!err){
				req.flash('dateMessage', date)
				res.render(process.cwd() + '/pages/admin/addReceiveFltr', {
					data: result, 
					user: req.user,
					fltrdate: req.flash('dateMessage')
				});
			}
			else{
				res.status(404).send(err);
			}
		});
	});
	app.post('/filter/add/save', isLoggedIn, (req,res)=>{
		let date=filterdata;
		codes = req.body.code,
		products = req.body.product,
		unit = req.body.unit,
		quantity = req.body.quantity,
		supply = req.body.supplier,
		ut = req.body.ut;
		if (Array.isArray(codes)== false && Array(codes).length == 1){
			let sql = `INSERT INTO receive (
				productCode,
				productName, 
				unitPrice, 
				quantity, 
				date, supplier, unit
				) VALUES (
					?,?,?,?,?,?,?)`;
			con.query(sql,[codes, products, unit, quantity, date, supply, ut], (err,result)=>{
				if (!err){
					req.flash('receiveMessage', 'Successfully saved');
					res.redirect('/admin/receive');
				}
				else{
					res.status(404).send(err);
				}
			});
		}
		else {
			codes.forEach((product, index, arr)=>{
				let p = products[index];
				let u = unit[index];
				let q = quantity[index];
				let s = supply[index];
				let utp = ut[index];
				let sql = `INSERT INTO receive (
					productCode,
					productName, 
					unitPrice, 
					quantity, 
					date, supplier, unit
					) VALUES (
						?,?,?,?,?,?,?)`;
				con.query(sql, [product, p, u, q, date, s, utp], (err,result)=>{
					if (!err){
						console.log('product added');
					}
					else{
						return res.status(404).send(err);
					}
				});
			});
			req.flash('receiveMessage', 'Successfully saved');
			res.redirect('/admin/receive');
		}
	});

	// CASHIER ROUTES =====================
	// =================================
	app.get('/cashier', isLoggedIn, (req,res)=>{
		let sql = "SELECT * FROM orders"
		con.query(sql, (err,result)=>{
			if(!err){
				res.render(process.cwd() + '/pages/cashier/history', {
					data:result,
					user: req.user,
					message: req.flash('historyMessage')
				});
			}
			else{
				res.status(404).send(err);
			}
		});	
	});
	app.get('/cashier/history', isLoggedIn, (req,res)=>{
		let sql = "SELECT * FROM orders"
		con.query(sql, (err,result)=>{
			if(!err){
				res.render(process.cwd() + '/pages/cashier/history', {
					data:result, 
					user: req.user,
					message: req.flash('historyMessage')
				});
			}
			else{
				res.status(404).send(err);
			}
		});	
	});
	app.get('/cashier/form', isLoggedIn,(req,res)=>{
		let sql = "SELECT * FROM stocks"
		let sql2 = "SELECT * FROM orders"
		con.query(sql, (err,result)=>{
			con.query(sql2, (err2,result2)=>{
				if(!err){
					res.render(process.cwd() + '/pages/cashier/form', {data2:result2, data:result, user: req.user});
	
				}
				else{
					res.status(404).send(err, err2);
				}
			})
		});	
	});
	app.post('/cashier/form/confirm', isLoggedIn, (req,res)=>{
		let codes = req.body.pcode,
		quanti = req.body.qty, 
		price = req.body.price, 
		cust = req.body.orderedBy,
		stat = req.body.status, 
		oDate = req.body.orderDate  + " " + new Date().getHours() + ":" + new Date().getMinutes(); 
		if (Array.isArray(codes)== false && Array(codes).length == 1){
				let sql = `INSERT INTO orders (productCode, productName, unitPrice, quantity, totalPrice, customer, date, status, unit)
				SELECT ?, productName, unitPrice, ?, ?, ?, ?, ?, unit
				FROM stocks
				WHERE productCode = ?`
				con.query(sql,[codes, quanti, price, cust, oDate, stat, codes], (err,result)=>{
					if (!err){
						req.flash('historyMessage', 'Order Created')
						res.redirect('/cashier/history')
					}
					else{
						console.log('only one', err);
						res.status(404).send(err);
					}
				})
		}
		else{
			codes.forEach((product, index, arr)=>{
				const q = quanti[index];
				const p = price[index];
				const s= stat[index];
				let sql = `INSERT INTO orders (productCode, productName, unitPrice, quantity, totalPrice, customer, date, status, unit)
				SELECT ?, productName, unitPrice, ?, ?, ?, ?, ?, unit
				FROM stocks
				WHERE productCode = ?`
				console.log(sql)
				con.query(sql,[product, q, p, cust, oDate, s, product], (err,result)=>{
					if (!err){
						console.log('Order Added');
					}
					else{
						console.log(sql)
						return res.send(err);
					}
				})
			})
		req.flash('historyMessage', 'Order Created')
		res.redirect('/cashier/history')
		}
	});

	app.post('/cashier/form/confirmPrint', isLoggedIn, (req,res)=>{
		let codes = req.body.pcode,
		quanti = req.body.qty, 
		price = req.body.price, 
		cust = req.body.orderedBy,
		stat = req.body.status, 
		oDate = req.body.orderDate + " " + new Date().getHours() + ":" + new Date().getMinutes(); 
		if (Array.isArray(codes)== false && Array(codes).length == 1){
				let sql = `INSERT INTO orders (productCode, productName, unitPrice, quantity, totalPrice, customer, date, status, unit)
				SELECT ?, productName, unitPrice, ?, ?, ?, ?, ?, unit
				FROM stocks
				WHERE productCode = ?`
				con.query(sql,[codes, quanti, price, cust, oDate, stat, codes], (err,result)=>{
					if (!err){
						//=======================SINGLE==============================
						//=====================================================
						doc.pipe(fs.createWriteStream(cust +" "+ req.body.orderDate + new Date().getMinutes() + '.pdf'))
						doc.font('Times-Roman', 16).text('R & R Merchandise', {align: 'center'})
							.font('Times-Roman', 12).text('Payment Receipt', {align: 'center'})
							.moveDown()
							.font('Courier' , 10).text('Customer: '+ cust, {align: 'left', continued: true})
							.text('Date: '+ req.body.orderDate, {align: 'right'})
							.moveDown()
							.font('Courier' , 10).text('-Product/s-', {align: 'left', continued: true})
							.text('Quantity ', {align: 'center', continued: true})
							.text('Sub-Total ', {align: 'right'})
							.moveDown()
							.font('Courier' , 10).text(''+ codes, {align: 'left', continued: true})
							.text(''+ quanti, {align: 'center', continued: true})
							.text(''+ price, {align: 'right'})
							.moveDown()
							.text('TOTAL:    '+ price, {align: 'right'})
							.moveDown()
							.moveDown()
							.text('Tel: Some Tel Number', {align: 'center'})
							.text('Email: Some email Address', {align: 'center'})
							.text('Address: Some Address', {align: 'center'});
						doc.end();
						req.flash('historyMessage', 'Order Created')
						res.redirect('/cashier/history')
					}
					else{
						console.log('only one', err);
						res.status(404).send(err);
					}
				})
		}
		else{
			codes.forEach((product, index, arr)=>{
				const q = quanti[index];
				const p = price[index];
				const s= stat[index];
				let sql = `INSERT INTO orders (productCode, productName, unitPrice, quantity, totalPrice, customer, date, status, unit)
				SELECT ?, productName, unitPrice, ?, ?, ?, ?, ?, unit
				FROM stocks
				WHERE productCode = ?`
				console.log(sql)
				con.query(sql,[product, q, p, cust, oDate, s, product], (err,result)=>{
					if (!err){
						console.log('Order Added');
					}
					else{
						console.log(sql)
						return res.send(err);
					}
				})
			})
		req.flash('historyMessage', 'Order Created')
		res.redirect('/cashier/history')
		}
	});
	
	app.get('/cashier/stocks', isLoggedIn, (req,res)=>{
		let sql = "SELECT * FROM stocks"
		con.query(sql, (err,result)=>{
			if(!err){
				res.render(process.cwd() + '/pages/cashier/Stocks', {data: result, user: req.user});
			}
			else{
				res.status(404).send(err);
			}
		});	
	});



	// LOGOUT =========================
	// ================================
	app.get('/logout', (req, res)=> {
		req.logout();
		res.redirect('/login');
	});


	function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
		res.redirect('/');
	}
}
