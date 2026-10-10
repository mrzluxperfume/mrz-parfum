import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'

const linkClass = 'underline underline-offset-2 transition hover:text-ink'

function ContactLink({ children }) {
  return (
    <Link to="/contact" className={linkClass}>
      {children}
    </Link>
  )
}

const questions = [
  {
    title: '1. Quels produits propose MRZ Perfume ?',
    body: (
      <p>
        MRZ Perfume vous propose une sélection de parfums de Dubaï, de parfums
        de niche et de parfums de collection, ainsi que des muscs et des brumes
        parfumées. Découvrez notre univers olfactif à travers une sélection de
        fragrances pour tous les goûts et toutes les envies.
      </p>
    ),
  },
  {
    title: '2. Comment commander sur notre site ?',
    body: (
      <p>
        Choisissez vos produits, ajoutez-les à votre panier, puis suivez les
        étapes de validation de commande. Vérifiez vos coordonnées et votre
        adresse de livraison avant de confirmer votre achat et de procéder au
        paiement.
      </p>
    ),
  },
  {
    title: '3. Les parfums proposés sont-ils authentiques ?',
    body: (
      <p>
        MRZ Parfum s’engage à proposer des produits authentiques provenant de
        ses circuits d’approvisionnement. Pour toute question concernant une
        référence ou une marque, notre équipe reste à votre disposition.
      </p>
    ),
  },
  {
    title: '4. Comment choisir mon parfum ?',
    body: (
      <>
        <p>
          Pour trouver le parfum qui vous correspond, consultez les descriptions
          de nos produits afin de découvrir leurs notes de tête, de cœur et de
          fond, ainsi que leur famille olfactive.
        </p>
        <p className="mt-3">
          Vous pouvez également retrouver notre rubrique «{' '}
          <Link to="/shop" className={linkClass}>
            Choisir mon parfum
          </Link>{' '}
          » sur le site. Grâce à un petit questionnaire, nous vous aidons à
          identifier les fragrances qui correspondent le mieux à vos goûts et à
          vos préférences olfactives.
        </p>
      </>
    ),
  },
  {
    title: '5. Quels sont les moyens de paiement acceptés ?',
    body: (
      <>
        <p>Pour faciliter vos achats, nous acceptons les moyens de paiement suivants :</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Carte bancaire</li>
          <li>Apple Pay</li>
          <li>Google Pay</li>
          <li>PayPal</li>
        </ul>
        <p className="mt-3">
          Les options disponibles vous sont proposées au moment du paiement.
        </p>
      </>
    ),
  },
  {
    title: '6. Quels sont les délais de livraison ?',
    body: (
      <>
        <p>
          En France métropolitaine, les commandes sont livrées en moins de 48
          heures, selon les conditions d’expédition et de transport.
        </p>
        <p className="mt-3">
          Pour les commandes expédiées hors d’Europe, le délai de livraison est
          généralement de 5 à 7 jours, soit environ une semaine, sous réserve de
          la destination et des éventuelles formalités douanières.
        </p>
        <p className="mt-3">
          Les informations applicables à votre commande sont communiquées lors
          du processus d’achat.
        </p>
      </>
    ),
  },
  {
    title: '7. Puis-je suivre ma commande ?',
    body: (
      <>
        <p>
          Oui ! Dès l’expédition de votre commande, vous recevez un e-mail
          contenant votre numéro de suivi. Celui-ci vous permet de suivre
          l’acheminement de votre colis jusqu’à sa livraison.
        </p>
        <p className="mt-3">
          Pensez à vérifier vos courriers indésirables si vous ne trouvez pas
          l’e-mail d’expédition.
        </p>
      </>
    ),
  },
  {
    title: '8. Puis-je modifier ou annuler ma commande ?',
    body: (
      <>
        <p>
          Si vous souhaitez modifier ou annuler votre commande, contactez-nous
          directement via le <ContactLink>formulaire de contact</ContactLink>{' '}
          disponible sur notre boutique en ligne, le plus rapidement possible.
        </p>
        <p className="mt-3">
          Nous ferons notre possible pour prendre en compte votre demande avant
          l’expédition. Une fois la commande expédiée, une modification ou une
          annulation peut ne plus être possible. Vos droits légaux restent
          applicables.
        </p>
      </>
    ),
  },
  {
    title: '9. Puis-je retourner un parfum ?',
    body: (
      <>
        <p>
          Pour qu’un parfum puisse être retourné au titre du droit de
          rétractation, il doit rester non ouvert et conserver son scellé
          d’origine lorsqu’il en possède un.
        </p>
        <p className="mt-3">
          Conformément à la réglementation, certaines exceptions s’appliquent
          notamment aux produits scellés qui ne peuvent être renvoyés pour des
          raisons d’hygiène ou de protection de la santé lorsqu’ils ont été
          descellés après la livraison.
        </p>
        <p className="mt-3">
          Pour toute demande de retour, contactez-nous via le{' '}
          <ContactLink>formulaire de contact</ContactLink> de notre site afin
          de connaître la procédure à suivre.
        </p>
      </>
    ),
  },
  {
    title:
      '10. Que faire si ma commande arrive endommagée ou si un produit est manquant ?',
    body: (
      <>
        <p>
          Si votre colis arrive endommagé, nous vous invitons à effectuer une
          réclamation auprès du transporteur et à conserver les éléments
          permettant de constater les dommages.
        </p>
        <p className="mt-3">
          Si un produit est manquant dans votre commande, contactez notre
          service client via le <ContactLink>formulaire de contact</ContactLink>{' '}
          en précisant votre numéro de commande. Après vérification, un
          remboursement partiel correspondant au produit manquant pourra être
          effectué.
        </p>
      </>
    ),
  },
  {
    title: '11. Puis-je acheter directement en boutique ?',
    body: (
      <>
        <p>
          Oui ! Vous pouvez également nous rendre visite dans notre boutique MRZ
          Perfume, située au :
        </p>
        <p className="mt-3">61 rue Racine, 69100 Villeurbanne, France.</p>
        <p className="mt-3">
          Nous serons ravis de vous accueillir pour vous faire découvrir notre
          sélection de parfums, de muscs et de fragrances.
        </p>
      </>
    ),
  },
  {
    title: '12. Comment contacter MRZ Perfume ?',
    body: (
      <>
        <p>
          Pour toute question concernant un produit, une commande ou une
          livraison, plusieurs possibilités s’offrent à vous :
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <ContactLink>Formulaire de contact</ContactLink> : directement
            accessible sur notre boutique en ligne.
          </li>
          <li>
            E-mail : notre adresse e-mail est indiquée dans le{' '}
            <ContactLink>formulaire de contact</ContactLink>.
          </li>
          <li>
            Courrier postal : MRZ Perfume, 61 rue Racine, 69100 Villeurbanne,
            France.
          </li>
        </ul>
        <p className="mt-3">
          Notre équipe reste à votre disposition pour vous accompagner et
          répondre à vos questions.
        </p>
        <p className="mt-3">
          Merci pour votre confiance et bienvenue dans l’univers MRZ Perfume !
        </p>
      </>
    ),
  },
]

export default function FaqPage() {
  return (
    <section className="py-14 md:py-20">
      <Container className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          MRZ Perfume
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">FAQ</h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink/80">
          {questions.map((item) => (
            <section key={item.title}>
              <h2 className="font-display text-2xl text-ink">{item.title}</h2>
              <div className="mt-3">{item.body}</div>
            </section>
          ))}
        </div>
      </Container>
    </section>
  )
}
