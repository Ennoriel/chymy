import { parse, type Rule } from '../../src';

const config = {
	method: 'sequence',
	sequence: [
		{ method: 'parse-to-html' },
		{
			method: 'record',
			discardPreviousSteps: true,
			record: {
				description: { method: 'html-text' },
				image: {
					method: 'sequence',
					sequence: [
						{ method: 'html-query-selector', selector: 'img' },
						{ method: 'html-attribute', attribute: 'src' }
					]
				}
			}
		}
	]
} satisfies Rule;

describe('cdata', () => {
	const cases = [
		{
			media: 'green IT',
			cdata: `
            <div>
            <a href="https://www.greenit.fr/2024/03/12/droits-et-devoirs-associes-aux-outils-du-collectif-green-it/"><img title="CC-By-NC-ND" src="https://i0.wp.com/www.greenit.fr/wp-content/uploads/2024/03/CC-By-NC-ND.png?fit=300%2C105&ssl=1" alt="Droits et devoirs associés aux outils du collectif Green IT" width="300" height="105" /></a>
            </div>
            Depuis quelques mois, nous avons beaucoup de questions sur ce que les collectivités, les entreprises et les prestataires peuvent faire, ou pas, avec les outils du collectif Green IT. L’objectif de cet article est de clarifier comment vous pouvez utiliser les outils que nous mettons gratuitement à votre disposition. Tous les outils du collectif sont [&#8230;]
            `,
			description:
				'Depuis quelques mois, nous avons beaucoup de questions sur ce que les collectivités, les entreprises et les prestataires peuvent faire, ou pas, avec les outils du collectif Green IT. L’objectif de cet article est de clarifier comment vous pouvez utiliser les outils que nous mettons gratuitement à votre disposition. Tous les outils du collectif sont […]',
			image:
				'https://i0.wp.com/www.greenit.fr/wp-content/uploads/2024/03/CC-By-NC-ND.png?fit=300%2C105&ssl=1'
		},
		{
			media: 'Humanité',
			cdata: `Miroir à paillettes autant qu’usine à rêves, le septième art est aussi un gigantesque pollueur. En France, le secteur émet 1,7&nbsp;million de tonnes de carbone par an. Soit l’équivalent, chaque jour, d’un aller-retour de 1&nbsp;million de passagers sur un vol Paris-New York. En coulisses, associations et professionnels s’activent pour tenter de verdir l’industrie cinématographique et audiovisuelle. Une action militante qui impacte jusqu’à l’organisation du Festival de Cannes.`,
			description:
				'Miroir à paillettes autant qu’usine à rêves, le septième art est aussi un gigantesque pollueur. En France, le secteur émet 1,7\u00A0million de tonnes de carbone par an. Soit l’équivalent, chaque jour, d’un aller-retour de 1\u00A0million de passagers sur un vol Paris-New York. En coulisses, associations et professionnels s’activent pour tenter de verdir l’industrie cinématographique et audiovisuelle. Une action militante qui impacte jusqu’à l’organisation du Festival de Cannes.'
		},
		{
			media: 'La Croix',
			cdata: `<p>Le premier parc éolien flottant, qui sera installé au large du Morbihan, a été attribué à un consortium composé de l’allemand BayWa r.e et du belge Elicio. Mais le prix proposé est ultra-compétitif, à 86,45 €/MWh. Intenable, affirment les concurrents, qui s’inquiètent de la guerre des prix en train de s’amorcer.</p>`,
			description:
				'Le premier parc éolien flottant, qui sera installé au large du Morbihan, a été attribué à un consortium composé de l’allemand BayWa r.e et du belge Elicio. Mais le prix proposé est ultra-compétitif, à 86,45 €/MWh. Intenable, affirment les concurrents, qui s’inquiètent de la guerre des prix en train de s’amorcer.'
		}
	];

	cases.forEach(({ media, cdata, description, image }) => {
		it(`${media} CDATA should be decoded`, async () => {
			expect(await parse(config, cdata)).toStrictEqual({ description, image });
		});
	});
});
