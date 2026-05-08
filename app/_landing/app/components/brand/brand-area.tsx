import React from 'react';

type IProps = {
	top_cls?: string;
	hideTitle?: boolean
}
const BrandArea = ({top_cls='brand-area',hideTitle=false }: IProps) => {
	if (hideTitle) return null;
	return (
		<section className={`${top_cls}`}>
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="brand__title text-center">
							<h2 className="title">they trust us</h2>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-12 text-center" style={{paddingTop:'24px',paddingBottom:'8px'}}>
						<span style={{fontFamily:'var(--tg-heading-font-family)',fontWeight:800,letterSpacing:'0.32em',fontSize:'clamp(2.25rem, 6vw, 4.5rem)',lineHeight:1,display:'inline-block'}}>
							<span style={{color:'#fbbf24'}}>D</span>
							<span style={{color:'#fff'}}>ENARO</span>
						</span>
					</div>
				</div>
			</div>
		</section>
	);
};

export default BrandArea;