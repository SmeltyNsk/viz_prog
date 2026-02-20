"use strict";
// интерфейс User вместе с функцией createUser
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimAndFormat = exports.capitalizeFirst = void 0;
exports.createUser = createUser;
exports.createBook = createBook;
exports.calculateArea = calculateArea;
exports.getStatusColor = getStatusColor;
exports.getFirstElement = getFirstElement;
exports.findById = findById;
function createUser(id, name, email, isActive) {
    if (isActive === void 0) { isActive = true; }
    return email !== undefined
        ? {
            id: id,
            name: name,
            email: email,
            isActive: isActive,
        }
        : {
            id: id,
            name: name,
            isActive: isActive,
        };
}
// примеры:
var user1 = createUser(1, "Егор");
var user2 = createUser(2, "random", "random@example.com", false);
function createBook(book) {
    return book;
}
// примеры:
var book1 = createBook({
    title: "Demian",
    author: "German Gesse",
    genre: "Roman",
});
var book2 = createBook({
    title: "Don Quixote",
    author: "Migel de Servantes",
    year: 1600,
    genre: "avantgarde",
});
// реализация функции площади
function calculateArea(shape, size) {
    if (shape === "circle") {
        return Math.PI * size * size;
    }
    return size * size;
}
// примеры:
var circleArea = calculateArea("circle", 5);
var squareArea = calculateArea("square", 4);
function getStatusColor(status) {
    switch (status) {
        case "active":
            return "green";
        case "inactive":
            return "gray";
        case "new":
            return "blue";
        default:
            var _exhaustiveCheck = status;
            return _exhaustiveCheck;
    }
}
// примеры:
var colorActive = getStatusColor("active");
var colorNew = getStatusColor("new");
var capitalizeFirst = function (input, uppercase) {
    if (uppercase === void 0) { uppercase = false; }
    if (!input)
        return "";
    var trimmed = input;
    var result = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    if (uppercase) {
        result = result.toUpperCase();
    }
    return result;
};
exports.capitalizeFirst = capitalizeFirst;
var trimAndFormat = function (input, uppercase) {
    if (uppercase === void 0) { uppercase = false; }
    var result = input.trim();
    if (uppercase) {
        result = result.toUpperCase();
    }
    return result;
};
exports.trimAndFormat = trimAndFormat;
var s1 = (0, exports.capitalizeFirst)("hello");
var s2 = (0, exports.trimAndFormat)("   hello world   ");
var s3 = (0, exports.trimAndFormat)("   hello world   ", true);
// обобщённая функция getFirstElement
function getFirstElement(arr) {
    return arr.length > 0 ? arr[0] : undefined;
}
// примеры:
var nums = [67, 2, 3];
var strs = ["d", "b", "c"];
var firstNum = getFirstElement(nums);
var firstStr = getFirstElement(strs);
function findById(items, id) {
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        if (item.id === id)
            return item;
    }
    return undefined;
}
// примеры:
var usersWithId = [
    { id: 1, name: "Alice", isActive: true },
    { id: 2, name: "Bob", isActive: false },
];
var foundUser = findById(usersWithId, 2);
// вывод в консоль
console.log("user1:", user1);
console.log("user2:", user2);
console.log("book1:", book1);
console.log("book2:", book2);
console.log("circleArea:", circleArea);
console.log("squareArea:", squareArea);
console.log("colorActive:", colorActive);
console.log("colorNew:", colorNew);
console.log("s1:", s1);
console.log("s2:", s2);
console.log("s3:", s3);
console.log("firstNum:", firstNum);
console.log("firstStr:", firstStr);
console.log("foundUser:", foundUser);
