import { useDados } from '../../dados/useDados'
import BarraDividida from '../../shared/components/BarraDividida'
import BarraProgresso from '../../shared/components/BarraProgresso'
import { nomeBonito } from './historico'
import PrevisaoDoCurso from './PrevisaoDoCurso'

/** Uma cor para cada tipo de disciplina, a mesma da legenda e das barras. */
const TIPOS = {
  obrigatoria: { rotulo: 'Obrigatória', cor: 'azul' },
  optativa: { rotulo: 'Optativa', cor: 'amarelo' },
  eletiva: { rotulo: 'Eletiva', cor: 'verde' },
  complementar: { rotulo: 'Complementar', cor: 'lilas' },
}

const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

/**
 * Progresso no curso, para qualquer curso: o que o histórico do SIGAA diz
 * sobre horas cumpridas, obrigatórias que faltam e disciplinas cursadas.
 * Sem a divisão por semestre, que o histórico não traz.
 */
export default function ProgressoNoCurso({
  progresso,
  importar,
  aoAbrirImportar,
  aoCursar,
}) {
  const { materias, esconderFluxograma } = useDados()
  const { curso, exigido, integralizado, pendentes, cursadas } = progresso
  const nomesNoSemestre = new Set(
    materias.map((materia) => normalizar(materia.nome)),
  )

  return (
    <section className="secao-caixa fluxo" aria-labelledby="fluxo-titulo">
      <header className="fluxo-topo">
        <div>
          <h2 id="fluxo-titulo">Progresso no curso</h2>
          <p>{nomeBonito(curso)}</p>
          <div className="fluxo-topo-acoes">
            {!importar && (
              <button
                type="button"
                className="secao-botao fluxo-abrir-importar"
                onClick={aoAbrirImportar}
              >
                Atualizar pelo histórico
              </button>
            )}
            <button
              type="button"
              className="secao-botao fluxo-botao-claro fluxo-abrir-importar"
              onClick={esconderFluxograma}
            >
              Esconder progresso
            </button>
          </div>
        </div>
        {exigido && <PrevisaoDoCurso progresso={progresso} />}
        {exigido && (
          <div className="fluxo-progresso">
            <span>
              <strong>{integralizado?.total ?? 0}</strong> de {exigido.total} h
              cumpridas
            </span>
            <BarraProgresso
              concluidas={integralizado?.total ?? 0}
              total={exigido.total}
              rotulo="Horas cumpridas no curso"
            />
            <BarraDividida exigido={exigido} integralizado={integralizado} />
          </div>
        )}
      </header>

      {importar}

      <ul className="curso-legenda" aria-label="Cores">
        {['obrigatoria', 'optativa', 'eletiva'].map((tipo) => (
          <li key={tipo} className={`materia-cor-${TIPOS[tipo].cor}`}>
            {TIPOS[tipo].rotulo}
          </li>
        ))}
      </ul>

      <h3 className="curso-subtitulo">
        Obrigatórias que faltam <span>{pendentes.length}</span>
      </h3>
      {pendentes.length === 0 ? (
        <p className="curso-vazio">Nenhuma obrigatória pendente. 🎉</p>
      ) : (
        <ul className="curso-lista" aria-label="Obrigatórias que faltam">
          {pendentes.map((disciplina) => {
            const nome = nomeBonito(disciplina.nome)

            return (
              <li
                key={disciplina.codigo}
                className="curso-disciplina materia-cor-azul"
              >
                <span className="curso-cabeca">
                  <span className="fluxo-codigo">{disciplina.codigo}</span>
                  <span className="fluxo-creditos">{disciplina.ch} h</span>
                  <button
                    type="button"
                    className="curso-cursar"
                    aria-label={`Cursar ${nome} neste semestre`}
                    title="Cursar neste semestre"
                    onClick={() =>
                      aoCursar({
                        codigo: disciplina.codigo,
                        nome,
                        cargaHoraria: disciplina.ch,
                      })
                    }
                  >
                    +
                  </button>
                </span>
                <span className="curso-nome">{nome}</span>
                {nomesNoSemestre.has(normalizar(nome)) && (
                  <span className="fluxo-etiqueta">Cursando</span>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {cursadas.length > 0 && (
        <details className="curso-cursadas">
          <summary>
            Cursadas <span>{cursadas.length}</span>
          </summary>
          <ul className="curso-lista" aria-label="Disciplinas cursadas">
            {cursadas.map((disciplina) => (
              <li
                key={disciplina.codigo}
                className={`curso-disciplina curso-cursada materia-cor-${
                  (TIPOS[disciplina.tipo] ?? TIPOS.obrigatoria).cor
                }`}
                title={(TIPOS[disciplina.tipo] ?? TIPOS.obrigatoria).rotulo}
              >
                <span className="curso-cabeca">
                  <span className="fluxo-codigo">{disciplina.codigo}</span>
                  <span className="fluxo-creditos">✓</span>
                </span>
                <span className="curso-nome">
                  {disciplina.nome ? nomeBonito(disciplina.nome) : '—'}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
