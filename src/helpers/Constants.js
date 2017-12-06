let statusText = ['ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ','ΕΤΟΙΜΑΖΕΤΑΙ', 'ΕΤΟΙΜΑΣΤΗΚΕ', 'ΣΤΟΝ ΔΡΟΜΟ'];
statusText[10] = 'ΟΛΟΚΛΗΡΩΘΗΚΕ';
statusText[99] = 'ΑΠΟΡΡΙΦΘΗΚΕ';

let lineColor = ['','', 'table-primary', 'table-info'];
lineColor[10] = 'table-success';
lineColor[99] = 'table-danger';


export default {
	lineColor,
	statusText
}