const Nightmare = require("nightmare");
const vo = require("vo");
const nightmare = Nightmare({ show: true });
const auth = require("./auth");
const fs = require("fs");

var num_result = 145;
var file_name = "scraper_data/toronto_operationmanager_logisticssupplychain.json";
var url = 
`https://www.linkedin.com/search/results/people/?company=&facetGeoRegion=%5B%22ca%3A4876%22%5D&facetIndustry=%5B%22116%22%2C%2293%22%5D&firstName=&keywords=operation%20manager&lastName=&origin=FACETED_SEARCH&school=&title=`
;

var run = function*() {
  yield nightmare
    .goto("https://www.linkedin.com/")
    .type("input#login-email", auth.username)
    .type("input#login-password", auth.password)
    .click("input#login-submit")
    .wait(2000);

  var titles = [];
  for (var i = 1; i <= Math.ceil(num_result / 10.0); i++) {
    yield nightmare
      .goto(
        url+`&page=${i}`
      )
      .wait(2000)
      .scrollTo(5000, 0)
      .wait(2000);
    var title = yield nightmare.evaluate(() => {
      var elements = Array.from(
        document.getElementsByClassName("search-result__info")
      );
      return elements.map(function(element) {
        var _location = null;
        var _company = null;
        if (element.children.length > 3){
          _location = element.children[2].innerText;
        }
        if (element.children.length > 4){
          _company = element.children[3].innerText;
        }
        return {
          name: element.children[0].querySelector(".actor-name").innerText,
          href: element.children[0].href,
          title: element.children[1].innerText,
          location: _location,
          company: _company
        };
      });
    });
    fs.readFile(file_name, "utf8", (err, data) => {
      var linkedinArray;
      if(err){
        linkedinArray = JSON.parse("[]");
      }
      else{
        linkedinArray = JSON.parse(data);
      }
      linkedinArray.push({ ...title, page: i });
      let stringifyData = JSON.stringify(linkedinArray);
      fs.writeFile(file_name, stringifyData, "utf8", () => {
        console.log("wrote to file");
      });
    });
  }
  
  return titles;
};

data = [];

vo(run)(function(err, titles) {
  console.dir("done");
});
