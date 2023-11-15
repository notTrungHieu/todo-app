const list_el = document.getElementById("list");
const create_btn_el = document.getElementById("create");
const remove_btn_el = document.getElementById("remove-finish");
const items = document.getElementsByClassName("item");
const login_btn_el = document.getElementById("login");
const login_container = document.getElementById("login-container");
const signup_container = document.getElementById("signup-container");
const login_form = document.getElementById("login-form");
const signup_form = document.getElementById("signup-form");
const close_login_btn = document.getElementById("close-login");
const signup_btn_el = document.getElementById("signup");
const close_signup_btn = document.getElementById("close-signup");
const showpass_login = document.getElementById("s-pass-login");
const pass_login = document.getElementById("pass-login");
const showpass_signup = document.getElementById("s-pass-signup");
const pass_signup = document.getElementById("pass-signup");
const pass_signup_confirm = document.getElementById("pass-signup-confirm");
const menu_icon = document.getElementById("menu");
const remember_btn = document.getElementById("remember");
const greeting_label = document.getElementById("greeting");
const logout_btn = document.getElementById("logout");
const background_el = document.getElementById("background");
const signup_link = document.getElementById("signup-link");
const login_link = document.getElementById("login-link");
const message_el = document.getElementById("message");
const message_detail = document.getElementById("message-content");
const username_login = document.getElementById("username-login");
const username_signup = document.getElementById("username-signup");
const menu = document.getElementById("menu-span");

let todos = [];

let userId = "";
let userName = "";

let isLogin = false;


//===============FUNCTIONS===================

function loadDataFromDB() {
	fetch("http://localhost:1000/getDataByUser/" + userId)
		.then((response) => response.json())
		.then((data) => DisplayTodosDB(data["data"]));
}

function clearList() {
	list_el.innerHTML = "";
}

function CreateNewTodo() {
	const item = {
		id: new Date().getTime(),
		text: "",
		complete: false,
	};
	todos.unshift(item);
	const { item_el, input_el } = CreateTodoElement(item, item.id);
	list_el.prepend(item_el);
	input_el.removeAttribute("disabled");
	input_el.focus();
	if (isLogin) {
		saveDB(userId, todos);
	} else {
		Save();
	}
}

function CreateTodoElement(item, index) {
	const item_el = document.createElement("div");
	item_el.classList.add("item");
	item_el.setAttribute("draggable", "true");
	item_el.setAttribute("id", index);
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.checked = item.complete;

	if (item.complete) {
		item_el.classList.add("complete");
	}

	const input_el = document.createElement("input");
	input_el.type = "text";
	input_el.value = item.text;
	input_el.setAttribute("disabled", "");

	const actions_el = document.createElement("div");
	actions_el.classList.add("actions");

	const edit_btn_el = document.createElement("button");
	edit_btn_el.classList.add("material-icons");
	edit_btn_el.innerText = "edit";

	const remove_btn_el = document.createElement("button");
	remove_btn_el.classList.add("material-icons", "remove-btn");
	remove_btn_el.innerText = "remove_circle";

	actions_el.append(edit_btn_el);
	actions_el.append(remove_btn_el);

	item_el.append(checkbox);
	item_el.append(input_el);
	item_el.append(actions_el);

	// ITEM EVENTS
	checkbox.addEventListener("change", () => {
		item.complete = checkbox.checked;

		if (item.complete) {
			item_el.classList.add("complete");
		} else {
			item_el.classList.remove("complete");
		}
		if (isLogin) {
			saveDB(userId, todos);
		} else {
			Save();
		}
	});

	input_el.addEventListener("input", () => {
		item.text = input_el.value;
	});

	input_el.addEventListener("keydown", function (e) {
		if (e.key === "Enter") {
			item.text = input_el.value;
			input_el.setAttribute("disabled", "");
			if (isLogin) {
				saveDB(userId, todos);
			} else {
				Save();
			}
		}
	});

	input_el.addEventListener("blur", () => {
		input_el.setAttribute("disabled", "");
		if (isLogin) {
			saveDB(userId, todos);
		} else {
			Save();
		}
	});

	edit_btn_el.addEventListener("click", () => {
		input_el.removeAttribute("disabled");
		input_el.focus();
		if (isLogin) {
			saveDB(userId, todos);
		} else {
			Save();
		}
	});

	remove_btn_el.addEventListener("click", () => {
		todos = todos.filter((t) => t.id != item.id);
		item_el.remove();
		if (isLogin) {
			saveDB(userId, todos);
		} else {
			Save();
		}
		if (todos.length === 0) {
			list_el.innerHTML = '<div id ="empty"> You have no task today </div>';
		}
	});

	item_el.addEventListener("dragstart", () => {
		item_el.classList.add("dragging");
	});

	item_el.addEventListener("dragend", (e) => {
		const dragging_item = document.querySelector(".dragging");
		const after = getAfterTodo(list_el, e.clientY);
		//const draggingId = getId(dragging_item);
		const dragging_index = todos.findIndex((t) => t.id == getId(dragging_item));
		let temp;

		if (after == null) {
			temp = todos[dragging_index];
			todos = todos.filter((t) => t != todos[dragging_index]);
			todos.push(temp);
			console.log(todos);
			console.log(dragging_index);
		} else {
			const after_index = todos.findIndex((t) => t.id == getId(after));
			//console.log(after);
			if (after_index == 0) {
				temp = todos[dragging_index];
				todos = todos.filter((t) => t != todos[dragging_index]);
				todos.unshift(temp);
			} else if (after_index > dragging_index) {
				for (let i = dragging_index; i < after_index - 1; i++) {
					[todos[i], todos[i + 1]] = [todos[i + 1], todos[i]];
				}
			} else if (after_index < dragging_index) {
				for (let i = dragging_index; i > after_index; i--) {
					[todos[i], todos[i - 1]] = [todos[i - 1], todos[i]];
				}
			}
		}

		item_el.classList.remove("dragging");

		if (isLogin) {
			saveDB(userId, todos);
		} else {
			Save();
		}
	});

	item_el.addEventListener("dragover", (e) => {
		e.preventDefault();
		const after = getAfterTodo(list_el, e.clientY);
		//console.log(after);
		const dragging_item = document.querySelector(".dragging");
		if (after == null) {
			list_el.appendChild(dragging_item);
		} else {
			list_el.insertBefore(dragging_item, after);
		}
	});

	return { item_el, input_el, edit_btn_el, remove_btn_el };
}

function DisplayTodosDB(arr) {
	if (arr.length === 0) {
		list_el.innerHTML = '<div id ="empty"> You have no task today </div>';
	} else {
		clearList();
		todos = arr;
		todos.forEach((t) => {
			const { item_el } = CreateTodoElement(t, t.id);
			list_el.append(item_el);
		});
	}
}

function DisplayTodos() {
	Load();
	if (todos.length === 0) {
		list_el.innerHTML = '<div id ="empty"> You have no task today </div>';
	} else {
		for (let i = 0; i < todos.length; i++) {
			const item = todos[i];
			const { item_el } = CreateTodoElement(item, todos[i].id);
			list_el.append(item_el);
		}
	}
}

function getAfterTodo(list, y) {
	const draggable_el = [...list.querySelectorAll(".item:not(.dragging)")];

	return draggable_el.reduce(
		(closet, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			//console.log (offset);
			if (offset < 0 && offset > closet.offset) {
				return { offset: offset, element: child };
			} else {
				return closet;
			}
		},
		{ offset: Number.NEGATIVE_INFINITY }
	).element;
}

function Save() {
	const save = JSON.stringify(todos);
	localStorage.setItem("my_todos", save);
}

function Load() {
	const data = localStorage.getItem("my_todos");
	if (data) {
		todos = JSON.parse(data);
	}
}

function getId(el) {
	return Number(el.id);
}

function deleteByUserId(id) {
	fetch("http://localhost:1000/delete/" + id, {
		method: "DELETE",
	})
		.then((response) => response.json());
}

function insertTaskToDB(id, text, complete, user) {
	fetch("http://localhost:1000/insert/" + userId, {
		headers: {
			"Content-type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({
			id: id,
			text: text,
			complete: complete,
			userid: user,
		}),
	})
		.then((response) => response.json())
}

function getUserInfo(id, pass) {
	fetch("http://localhost:1000/login/", {
		headers: {
			"Content-type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({
			id: id,
			password: pass,
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data["data"].res) {
				console.log("login success");
				console.log(data["data"].id);
			} else {
				console.log("login failed");
			}
		});
}

function insertUserToDB(id, pass) {
	fetch("http://localhost:1000/signup/", {
		headers: {
			"Content-type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({
			id: id,
			password: pass,
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data["data"].res) {
				console.log("signup succcess");
				console.log(data["data"].id);
			} else {
				console.log("signup failed");
			}
		});
}

function saveDB(user, arr) {
	deleteByUserId(user);
	arr.forEach((t) => {
		insertTaskToDB(t.id, t.text, t.complete, userId);

	});
}

function saveLoginSession() {
	sessionStorage.clear();
	sessionStorage.setItem("user", JSON.stringify(userName));
	sessionStorage.setItem("userId", JSON.stringify(userId));
}

function getLoginSession() {
	const data = sessionStorage.getItem("user");
	const user_id = sessionStorage.getItem("userId");
	const session = localStorage.getItem("session");
	if (user_id) {
		userName = JSON.parse(data);
		userId = JSON.parse(user_id);
		isLogin = true;
	} else if (session) {
		fetch("http://localhost:1000/get_session/", {
			headers: {
				"Content-type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({
				id: session,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				//console.log(data["data"]);
				userId = data["data"][0].session_id;
				userName = data["data"][0].data;
				isLogin = true;
			});
	}
}

function clearLoginSession() {
	sessionStorage.clear();
	let session = localStorage.getItem("session");
	if (session) {
		localStorage.removeItem("session");
		fetch("http://localhost:1000/delete_session/", {
			headers: {
				"Content-type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({
				id: userId
			}),
		});
	}
	userId = "";
	userName = "";
	isLogin = false;
	todos = [];
	greeting_label.innerHTML = "<h1> Hello </h1>";
}

function rememberLogin() {
	fetch("http://localhost:1000/session/", {
		headers: {
			"Content-type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({
			id: userName,
		}),
	}).then((response) => response.json());
}

function loadGreeting() {
	if (userName.length > 0) {
		greeting_label.innerHTML = "<h1> Hello, " + userName + "</h1>";
		logout_btn.classList.remove("hide");
	}
}

function drawMessage(message, type) {
	message_el.classList.remove("hide");
	message_detail.classList.add(type);
	message_detail.innerHTML = "<p>" + message + "</p>";
	setTimeout(() => {
		message_el.classList.add("hide");
		message_detail.classList.remove(type);
	}, 3000);
}

function isNumber(evt) {
	evt = evt ? evt : window.event;
	var charCode = evt.which ? evt.which : evt.keyCode;
	if (charCode > 31 && (charCode < 48 || charCode > 57)) {
		return false;
	}
	return true;
}

function isAlpha(evt) {
	evt = evt ? evt : window.event;
	var charCode = evt.which ? evt.which : evt.keyCode;
	if (
		charCode > 31 &&
		(charCode < 65 || charCode > 90) &&
		(charCode < 97 || charCode > 122)
	) {
		return false;
	}
	return true;
}


function resetSignupForm() {
	username_signup.value = "";
	pass_signup.value = "";
	pass_signup_confirm.value = "";
	if (showpass_signup.cheked) {
		showpass_signup.click();
	}
}

function resetLoginForm() {
	username_login.value = "";
	pass_login.value = "";
	if (showpass_login.checked) {
		showpass_login.click();
	}
	if (remember_btn.checked) {
		remember_btn.click();
	}
}
//==============EVENTS==============

let signup_validate = false;

getLoginSession();

setTimeout(loadGreeting, 500);

window.addEventListener("load", () => {
	isLogin ? loadDataFromDB() : DisplayTodos();
});

create_btn_el.addEventListener("click", () => {
	const empty = document.getElementById("empty");
	if (empty) {
		const parent = empty.parentNode;
		parent.removeChild(empty);
	}
	CreateNewTodo();
});

remove_btn_el.addEventListener("click", () => {
	todos = todos.filter((t) => !t.complete);
	if (isLogin) {
		saveDB(userId, todos);
		clearList();
		loadDataFromDB();
	} else {
		Save();
		clearList();
		DisplayTodos();
	}
});

message_el.addEventListener("click", () => {
	message_el.classList.add("hide");
});

logout_btn.addEventListener("click", () => {
	clearLoginSession();
	logout_btn.classList.add("hide");
	clearList();
	setTimeout(DisplayTodos(), 2000);
});

login_btn_el.addEventListener("click", () => {
	login_container.classList.remove("hide");
	background_el.classList.remove("hide");
});

close_login_btn.addEventListener("click", () => {
	login_container.classList.add("hide");
	background_el.classList.add("hide");
	resetLoginForm();
});

signup_btn_el.addEventListener("click", () => {
	signup_container.classList.remove("hide");
	background_el.classList.remove("hide");
});

close_signup_btn.addEventListener("click", () => {
	signup_container.classList.add("hide");
	background_el.classList.add("hide");
	resetSignupForm();
});

showpass_login.addEventListener("click", () => {
	pass_login.type === "password"
		? (pass_login.type = "text")
		: (pass_login.type = "password");
});

showpass_signup.addEventListener("click", () => {
	pass_signup.type === "password"
		? (pass_signup.type = "text")
		: (pass_signup.type = "password");
	pass_signup_confirm.type === "password"
		? (pass_signup_confirm.type = "text")
		: (pass_signup_confirm.type = "password");
});

pass_signup.addEventListener("change", () => {
	if (pass_signup.value.length < 5) {
		drawMessage("Password length must be 5 or more characters", "error");
		pass_signup.focus();
	}
});

pass_signup_confirm.addEventListener("change", () => {
	if (pass_signup.value !== pass_signup_confirm.value) {
		drawMessage("Confirm password doesn't match!", "error");
		pass_signup_confirm.focus();
	} else {
		signup_validate = true;
	}
});

pass_signup.addEventListener("keypress", (e) => {
	isAlpha(e);
	isNumber(e);
});

pass_signup_confirm.addEventListener("keypress", (e) => {
	isAlpha(e);
	isNumber(e);
});

login_link.addEventListener("click", () => {
	login_container.classList.remove("hide");
	signup_container.classList.add("hide");
	resetSignupForm();
});

signup_link.addEventListener("click", () => {
	signup_container.classList.remove("hide");
	login_container.classList.add("hide");
	resetLoginForm();
});

signup_form.addEventListener("submit", (e) => {
	e.preventDefault();
	if (signup_validate) {
		let username = document.getElementById("username-signup").value.toLowerCase();
		let password = pass_signup_confirm.value;
		fetch("http://localhost:1000/signup/", {
			headers: {
				"Content-type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({
				id: username,
				password: password,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data["data"].res) {
					setTimeout(signup_container.classList.add("hide"), 1000);
					username_login.value = username_signup.value;
					pass_login.value = pass_signup_confirm.value;
					setTimeout(login_container.classList.remove("hide"), 500);
					drawMessage("Sign up success", "success");
					resetSignupForm();
				} else {
					drawMessage(
						"Username has been used, please use another one!",
						"error"
					);
				}
			}).catch(() =>{
				drawMessage("Signup failed, cannot reach server", "error");
			});
	} else {
		return false;
	}
});

menu_icon.addEventListener("click", () => {
	if (document.getElementsByClassName("menu-icon").length === 1) {
		menu_icon.classList.remove("menu-icon");
		menu_icon.innerHTML = "close";
		menu.classList.remove("hide");
	} else {
		menu_icon.classList.add("menu-icon");
		menu_icon.innerHTML = "menu";
		menu.classList.add("hide");
	}
});

login_form.addEventListener("submit", (e) => {
	e.preventDefault();
	let username = document.getElementById("username-login").value.toLowerCase();
	let password = pass_login.value;
	
		fetch("http://localhost:1000/login/", {
			headers: {
				"Content-type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({
				id: username,
				password: password,
			}),
		})
		.then((response) => response.json())
		.then((data) => {
			if (data["data"].res) {
				userId = data["data"].id;
				userName = username;
				if (remember_btn.checked) {
					rememberLogin();
					const session = localStorage.getItem("session");
					if (session) {
						localStorage.removeItem("session");
					}
					localStorage.setItem("session", userId);
				}
				drawMessage("Login success", "success");
				setTimeout(login_container.classList.add("hide"), 1000);
				setTimeout(background_el.classList.add("hide"), 1000);
				resetLoginForm();
				clearList();
				loadGreeting();
				loadDataFromDB();
				isLogin = true;
				saveLoginSession();
				menu_icon.click();
			} else {
				drawMessage("Login failed, wrong username or password", "error");
			}
		}).catch(() =>{
			drawMessage("Login failed, cannot reach server", "error");
		});
	
});
