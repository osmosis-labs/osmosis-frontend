export interface AdCMS {
  banners: Ad[];
}

export interface Ad {
  name: string;
  start_date: string;
  end_date: string;
  header: string;
  subheader: string;
  external_url: string;
  icon_image_url: string;
  icon_image_alt: string;
  gradient: string;
  font_color: string;
  arrow_color: string;
  featured: true;
}
