export const xml = `<items>
    <item>
        <name attr="cautious"> <![CDATA[Couteau]]> </name>
        <size> 12 </size>
    </item>
    <item>
        <name> <![CDATA[Fourchette]]> </name>
        <size> 14 </size>
    </item>
</items>`;

export const parsedXml = {
    items: {
        item: [
            {
                "name": { "_attributes": { "attr": "cautious", }, "_cdata": "Couteau", },
                "size": { "_text": " 12 ", },
            },
            {
                "name": { "_cdata": "Fourchette", },
                "size": { "_text": " 14 ", },
            }
        ]
    }
}

export const html = `<html encoding="ISO-8859-1">
    <body>
        <p>Hello world!</p>
        <ul>
            <li title="raspberry"> framboise </li>
            <li title="blackcurrant"> cassis </li>
            <li title="gooseberry"> groseille </li>
        </ul>
    </body>
</html>
`;
