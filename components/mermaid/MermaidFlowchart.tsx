interface MermaidFlowchartProps {
  chart: string
}

const MermaidFlowchart = ({ chart }: MermaidFlowchartProps) => {
  // const elementRef = useRef<HTMLDivElement>(null)
  // useEffect(() => {
  //   const renderChart = async () => {
  //     if (elementRef.current) {
  //       mermaid.initialize({
  //         startOnLoad: false,
  //         theme: 'default',
  //         securityLevel: 'loose',
  //       })
  //       try {
  //         const { svg } = await mermaid.render(
  //           `mermaid-${Math.random().toString(36).substring(7)}`,
  //           chart,
  //         )
  //         if (elementRef.current) {
  //           elementRef.current.innerHTML = svg
  //         }
  //       } catch (error) {
  //         console.error('Mermaid rendering failed:', error)
  //       }
  //     }
  //   }
  //   renderChart()
  // }, [chart])
  // return <div ref={elementRef} className="mermaid-wrapper" />
  return <div>MermaidFlowchart</div>
}

export default MermaidFlowchart
