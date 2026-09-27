const fullTestimonial=[
  'Discovery Child Care INC had an excellent experience working with Chris Conley on our new website. The improved UI, UX, and overall visual appeal have made a noticeable difference in our online presence and have contributed to increased business.',
  'Chris was friendly, accommodating, knowledgeable, and consistently communicated in a timely manner. What stood out most was his ability to meet us where we were, understand our needs, develop a clear vision, and guide us toward our goals without making the process feel overwhelming.',
  "Chris' expertise also extended beyond web development. He was highly skilled with Google Ads and seamlessly connected our website with Google’s advertising platform, helping create a much more cohesive digital marketing presence.",
  'We would highly recommend Chris to any business looking for a web developer who combines technical expertise, creativity, communication, and a genuine understanding of business goals.'
];

export default function DiscoveryTestimonial(){
  return <figure className="featured-testimonial">
    <figcaption><a href="https://discoverychildcare.co/" target="_blank" rel="noopener noreferrer">Discovery Child Care INC</a><span>Website & Google Ads</span></figcaption>
    <div className="featured-testimonial-body">
      <blockquote>“The improved UI, UX, and overall visual appeal have made a noticeable difference in our online presence and have contributed to increased business.”</blockquote>
      <details className="full-testimonial"><summary><span className="testimonial-read">Read the full testimonial</span><span className="testimonial-close">Close the full testimonial</span></summary><blockquote>{fullTestimonial.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</blockquote></details>
    </div>
  </figure>;
}
