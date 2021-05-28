import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React, { FunctionComponent } from 'react';
import { GradientColorObject } from 'highcharts';

const defaultOptions: Partial<Highcharts.Options> = {
	chart: {
		type: 'pie',
		style: { filter: 'alpha(opacity=10)', opacity: 10, background: 'transparent' },
		margin: [0, 0, 0, 0],
		spacing: [0, 0, 0, 0],
		height: 200,
		width: 200,
	},
	xAxis: {
		type: 'datetime',
		maxPadding: 0,
		minPadding: 0,
		margin: 0,
	},
	yAxis: {
		maxPadding: 0,
		minPadding: 0,
		margin: 0,
	},
	tooltip: {
		pointFormatter: function() {
			return `<p>${this.x}<span style='font-size: 10px;'>${this.name.toUpperCase()}</span> / ${this.y}%</p>`;
		},
	},
	title: {
		text: undefined,
	},
	subtitle: {
		text: undefined,
	},
	accessibility: {
		announceNewData: {
			enabled: true,
		},
		point: {
			valueSuffix: '%',
		},
	},
	credits: {
		enabled: false,
	},
	plotOptions: {
		pie: {
			borderColor: 'transparent',
		},
	},
};

export const HIGHCHART_GRADIENTS: GradientColorObject[] = [
	{
		linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
		stops: [
			[0, '#6976FE'],
			[1, '#3339FF'],
		],
	},
	{
		linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
		stops: [
			[0, '#FF7A45'],
			[1, '#FF00A7'],
		],
	},
	{
		linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
		stops: [
			[0, '#FFBC00'],
			[1, '#FF8E00'],
		],
	},
	{
		linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
		stops: [
			[0, '#00CEBA'],
			[1, '#008A7D'],
		],
	},
];

export const HIGHCHART_LEGEND_GRADIENTS: string[] = [
	'linear-gradient(180deg, #6976FE 0%, #3339FF 100%)',
	'linear-gradient(180deg, #FF7A45 0%, #FF00A7 100%)',
	'linear-gradient(180deg, #FFBC00 0%, #FF8E00 100%)',
	'linear-gradient(180deg, #00CEBA 0%, #008A7D 100%)',
];

export const PieChart: FunctionComponent<HighchartsReact.Props & { height?: number; width?: number }> = props => {
	const [options, setOptions] = React.useState<Partial<Highcharts.Options>>(defaultOptions);
	React.useEffect(() => {
		if (!props.options) return;
		setOptions(v => {
			if (props.height && props.width) {
				v.chart = { ...v.chart, height: props.height, width: props.width };
			}
			return { ...v, ...props.options };
		});
	}, [props.options, props.height, props.width]);
	return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const series = [
	{
		name: 'Browsers',
		colorByPoint: true,
		data: [
			{
				name: 'Chrome',
				y: 62.74,
				drilldown: 'Chrome',
			},
			{
				name: 'Firefox',
				y: 10.57,
				drilldown: 'Firefox',
			},
			{
				name: 'Internet Explorer',
				y: 7.23,
				drilldown: 'Internet Explorer',
			},
			{
				name: 'Safari',
				y: 5.58,
				drilldown: 'Safari',
			},
			{
				name: 'Edge',
				y: 4.02,
				drilldown: 'Edge',
			},
			{
				name: 'Opera',
				y: 1.92,
				drilldown: 'Opera',
			},
			{
				name: 'Other',
				y: 7.62,
				drilldown: '',
			},
		],
	},
];
