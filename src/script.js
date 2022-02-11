/* Common functions */
class Paginator {
  constructor(current, all, parentElement) {
    this.current = current;
    this.all = all;
    this.parentElement = parentElement;
  }

  render() {
    if (this.all === 1) {
      return;
    }
    const links = [1, this.all];
    for (let i = this.current - 2; i <= this.current + 2; i++) {
      if (i < 1 || i > this.all || links.length > 7) {
        continue;
      }
      links.push(i);
    }
    const uniqLinks = [...new Set(links)];
    uniqLinks.sort((a, b) => a - b);

    for (let i = 0; i < uniqLinks.length; i++) {
      this._renderLink(uniqLinks[i]);
      if (i + 1 < uniqLinks.length && uniqLinks[i] + 1 !== uniqLinks[i + 1]) {
        this.__renderDots();
      }
    }
  }

  _renderLink(pageNum) {
    const span = document.createElement("span");
    span.innerHTML = pageNum;
    span.className = "pagination_num";
    span.onclick = setCurrentPage;

    if (pageNum == this.current) {
      span.classList.add("current");
    }

    this.parentElement.appendChild(span);
  }

  __renderDots() {
    const span = document.createElement("span");
    span.innerHTML = "...";
    this.parentElement.appendChild(span);
  }
}

const setCurrentPage = (e) => {
  currentPage = Number(e.target.innerHTML);
  getComments("goToNewCurrentPage");
};

const redrawingPagination = () => {
  elPagination.innerHTML = "";
  paginator.current = currentPage;
  paginator.all = maxPage;
  paginator.render();
};

const showMoreComments = () => {
  currentPage += 1;
  getComments("getNextComments");
};

const createPaginator = () => {
  paginator = new Paginator(currentPage, maxPage, elPagination);
};

const updateArrayList = (objPage) => {
  objPage.data.forEach((element) => {
    arrayListComments.push(element);
  });
};

const сreateForm = () => {
  const formParent = document.createElement("form");
  const h1Form = document.createElement("h1");
  const formInputName = document.createElement("input");
  const formInputText = document.createElement("textarea");
  const blockButton = document.createElement("div");
  const buttonForm = document.createElement("input");

  buttonForm.type = "submit";
  buttonForm.value = "post";
  formParent.method = "post";
  formParent.onsubmit = sendComment;

  h1Form.innerHTML = "Comments";

  formInputName.type = "text";
  formInputName.id = "name";
  formInputName.min = "1";
  formInputName.placeholder = "Name";
  formInputName.required = true;

  formInputText.type = "text";
  formInputText.id = "text";
  formInputText.min = "1";
  formInputText.placeholder = "Text";
  formInputText.required = true;
  
  formParent.appendChild(h1Form);
  formParent.appendChild(formInputName);
  formParent.appendChild(formInputText);
  blockButton.appendChild(buttonForm);
  formParent.appendChild(blockButton);

  elForm.appendChild(formParent);
};

const sendComment = (e) => {
  e.preventDefault();
  postComments({
    name: document.getElementById("name").value,
    text: document.getElementById("text").value,
  });
  document.getElementById("name").value = "";
  document.getElementById("text").value = "";
};

function mydiff(interval,timediff) {
  const second=1000, minute=second*60, hour=minute*60, day=hour*24, week=day*7;
  if (isNaN(timediff)) return NaN;
  switch (interval) {
      case "days"   : return Math.floor(timediff / day); 
      case "hours"  : return Math.floor(timediff / hour); 
      default: return undefined;
  }
}

/* Query code */
const elRoot = document.getElementById("root");
const elButton = document.getElementById("button");
const elPagination = document.getElementById("pagination");
const elForm = document.getElementById("form");

const buttonShowMore = document.createElement("button");
buttonShowMore.innerHTML = "Show more";
buttonShowMore.onclick = showMoreComments;
elButton.appendChild(buttonShowMore);

сreateForm();

let arrayListComments = [];
let maxPage = 0;
let currentPage = 1;
let paginator = "";

const redrawingComments = () => {
  elRoot.innerHTML = "";
  let presentData = new Date().toJSON();
  let textDate = "";

  presentData = Date.parse(presentData);
  arrayListComments.forEach((el) => {
    const dateParse = Date.parse(el.updated_at);

    const blockComment = document.createElement("div");
    const blockAuthorAndDate = document.createElement("div");
    const authorComment = document.createElement("span");
    const textComment = document.createElement("span");
    const dateCreate = document.createElement("span");

    const raznica = presentData - dateParse;
    let postDate = mydiff("days", raznica);

    blockComment.className = "comment";
    authorComment.className = "comment_author";
    textComment.className = "comment_text";
    blockAuthorAndDate.className = "comment_date_autor";

    if (postDate === 0) {
      postDate = mydiff("hours", raznica);
      textDate = `${postDate} hours ago`;
    } else {
      textDate = `${postDate} days ago`;
    }

    dateCreate.innerHTML = textDate;
    authorComment.innerHTML = el.name;
    textComment.innerHTML = el.text;

    blockAuthorAndDate.appendChild(authorComment);
    blockAuthorAndDate.appendChild(dateCreate);
    blockComment.appendChild(blockAuthorAndDate);
    blockComment.appendChild(textComment);

    elRoot.appendChild(blockComment);
  });
};

getComments("", true);

/* DAL */
async function postComments(objValues) {
  const response = await fetch(
    `https://jordan.ashton.fashion/api/goods/30/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(objValues),
    }
  );

  if (response.status === 200) {
    createPaginator();
    redrawingPagination();
    if (currentPage === maxPage) {
      getComments("goToNewCurrentPage");
      redrawingComments();
    }
  }
}

async function getComments(func = "", needCreatePaginator = false) {
  fetch(
    `https://jordan.ashton.fashion/api/goods/30/comments?page=${currentPage}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((objPage) => {
      maxPage = objPage.last_page;
      if (needCreatePaginator) {
        createPaginator();
      }
      if (func && func === "getNextComments") {
        updateArrayList(objPage);
      } else if (func && func === "goToNewCurrentPage") {
        arrayListComments = [];
        updateArrayList(objPage);
      } else if (!func) {
        updateArrayList(objPage);
      }
      redrawingPagination();
      redrawingComments();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  currentPage === maxPage
    ? (elButton.style.display = "none")
    : (elButton.style.display = "block");
}
