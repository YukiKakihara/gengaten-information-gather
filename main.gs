const setEventInfoToSheet = () => {
  const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  const sheetName = PropertiesService.getScriptProperties().getProperty('SHEET_NAME');
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);
  const eventList = getEventList();

  eventList.forEach((event, index) => {
    const row = index + 2;
    sheet.getRange(`A${row}`).setValue(event.term);
    sheet.getRange(`B${row}`).setValue(event.title);
    sheet.getRange(`C${row}`).setValue(event.url);
  });
}

const getEventList = () => {
  let page = 0;
  let result = [];

  do {
    page++;
    const url = `https://www.gengaten.info/page/${page}`;
    const options = { 'muteHttpExceptions': true };
    const html = UrlFetchApp.fetch(url, options).getContentText();
    result.push(...parseHtml(html));
  } while (page <= 9);

  return result;
};

const parseHtml = (html) => {
  const eventList = [];
  const articles = Parser.data(html).from('<article class="loop-article magazine one">').to('</article>').iterate();

  articles.forEach((article, index) => {
    const term = removeHtmlTag(Parser.data(article).from('<div class="loop-cat meta-cat">').to('</div>').build());
    const title = removeHtmlTag(Parser.data(article).from('<h1 class="entry-title loop-title magazine one">').to('</h1>').build());
    const url = article.match(/https:\/\/.+?(?=")/g)[0];
    if (title.match('東京|神奈川|千葉|埼玉')) {
      eventList.push({ term, title, url });
    }
  })

  return eventList;
};

const removeHtmlTag = (html) => {
  return html.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
};