/**
 * Strapi Content Renderer Component
 * Renders dynamic content fetched from Strapi CMS
 */

import React from 'react';

interface StrapiBlock {
  id: string;
  __component: string;
  [key: string]: any;
}

interface StrapiContentRendererProps {
  content: StrapiBlock[];
  className?: string;
}

/**
 * Maps Strapi component types to their rendering functions
 */
const componentMap: Record<string, React.ComponentType<any>> = {
  'blocks.text': (props: any) => (
    <div className="prose prose-lg max-w-none">
      <p>{props.content}</p>
    </div>
  ),
  'blocks.heading': (props: any) => (
    <h2 className="text-3xl font-bold my-4">{props.title}</h2>
  ),
  'blocks.image': (props: any) => (
    <div className="my-8">
      <img
        src={props.image?.url}
        alt={props.image?.alternativeText || 'Content image'}
        className="max-w-full h-auto rounded-lg"
      />
    </div>
  ),
  'blocks.video': (props: any) => (
    <div className="my-8">
      <iframe
        src={props.videoUrl}
        title={props.title}
        allowFullScreen
        className="w-full aspect-video rounded-lg"
      />
    </div>
  ),
};

export const StrapiContentRenderer: React.FC<StrapiContentRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content || !Array.isArray(content)) {
    return null;
  }

  return (
    <div className={`strapi-content ${className}`}>
      {content.map((block) => {
        const Component = componentMap[block.__component];

        if (!Component) {
          console.warn(`Unknown component type: ${block.__component}`);
          return null;
        }

        return (
          <div key={block.id} className="mb-8">
            <Component {...block} />
          </div>
        );
      })}
    </div>
  );
};

export default StrapiContentRenderer;
