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

export default function TermsPage() {
  return (
    <section className="py-14 md:py-20">
      <Container className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          MRZ Perfume
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">
          Conditions générales de vente
        </h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink/80">
          <section>
            <h2 className="font-display text-2xl text-ink">Article 1 – Objet</h2>
            <p className="mt-3">
              Les présentes conditions générales de vente définissent les
              modalités de vente en ligne des produits proposés par MRZ Perfume
              sur son site internet.
            </p>
            <p className="mt-3">
              Elles s’appliquent aux commandes passées par les consommateurs
              auprès de MRZ Perfume, sous réserve des dispositions légales
              impératives applicables.
            </p>
            <p className="mt-3">
              Toute commande implique la prise de connaissance des présentes
              conditions générales de vente et leur acceptation par le client
              avant la validation de son achat.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 2 – Identification du vendeur
            </h2>
            <p className="mt-3">Nom commercial : MRZ Parfum</p>
            <p className="mt-3">
              Adresse de la boutique : 61 rue Racine, 69100 Villeurbanne,
              France.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Article 3 – Produits</h2>
            <p className="mt-3">
              MRZ Perfume propose notamment des parfums, des eaux de parfum, des
              muscs, des brumes parfumées et des fragrances de différentes
              marques.
            </p>
            <p className="mt-3">
              Chaque fiche produit présente les caractéristiques essentielles du
              produit, son prix et, lorsque cela est applicable, sa contenance.
            </p>
            <p className="mt-3">
              Les photographies, visuels et descriptions sont présentés avec le
              plus grand soin. De légères différences de couleur ou de rendu
              peuvent exister selon les écrans. Ces différences ne dispensent
              pas le vendeur de son obligation de livrer un produit conforme à
              sa description.
            </p>
            <p className="mt-3">
              Le client est invité à consulter attentivement la fiche produit
              avant de passer commande.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Article 4 – Prix</h2>
            <p className="mt-3">
              Les prix sont indiqués en euros, toutes taxes comprises lorsque la
              TVA est applicable, hors frais de livraison éventuels.
            </p>
            <p className="mt-3">
              Le prix applicable est celui affiché au moment de la validation de
              la commande. Les frais de livraison et les éventuels frais
              supplémentaires sont communiqués au client avant la confirmation
              définitive de son achat.
            </p>
            <p className="mt-3">
              MRZ Perfume se réserve le droit de modifier ses prix à tout
              moment. Toute modification ne s’applique pas aux commandes déjà
              valablement confirmées.
            </p>
            <p className="mt-3">
              En cas de promotion, les conditions de l’offre et sa durée de
              validité sont indiquées sur le site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Article 5 – Commande</h2>
            <p className="mt-3">
              Le client sélectionne les produits souhaités, les ajoute à son
              panier et renseigne les informations nécessaires au traitement de
              sa commande.
            </p>
            <p className="mt-3">
              Avant de confirmer son achat, il peut vérifier le contenu de son
              panier, corriger les éventuelles erreurs et consulter le montant
              total à payer.
            </p>
            <p className="mt-3">
              La commande devient définitive après sa validation et la
              confirmation du paiement, sous réserve des éventuelles
              vérifications nécessaires.
            </p>
            <p className="mt-3">
              Le client reçoit une confirmation de commande par voie
              électronique, sous réserve qu’il ait communiqué une adresse e-mail
              valide.
            </p>
            <p className="mt-3">
              Le vendeur se réserve le droit de contacter le client en cas
              d’erreur manifeste, de difficulté de paiement ou d’indisponibilité
              d’un produit. En cas d’impossibilité d’exécuter une commande déjà
              payée, les sommes correspondantes seront remboursées selon les
              règles applicables.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 6 – Disponibilité des produits
            </h2>
            <p className="mt-3">
              Les offres sont proposées dans la limite des stocks disponibles.
            </p>
            <p className="mt-3">
              En cas d’indisponibilité d’un produit après la passation de la
              commande, le client en sera informé dans les meilleurs délais. Il
              pourra obtenir le remboursement des sommes versées pour le produit
              indisponible, selon les modalités légales applicables.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Article 7 – Paiement</h2>
            <p className="mt-3">
              Le paiement s’effectue au moyen des méthodes proposées sur le site
              au moment de la commande.
            </p>
            <p className="mt-3">
              Le montant total dû, comprenant le prix des produits et les frais
              applicables, est présenté avant la confirmation définitive de
              l’achat.
            </p>
            <p className="mt-3">
              La commande est préparée après confirmation du paiement, sauf
              disposition contraire affichée sur le site.
            </p>
            <p className="mt-3">
              Les données bancaires sont traitées par le prestataire de paiement
              utilisé par le site selon ses propres conditions et mesures de
              sécurité. MRZ Perfume ne doit pas demander au client de communiquer
              son code confidentiel bancaire par e-mail ou par message.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Article 8 – Livraison</h2>
            <p className="mt-3">
              Les produits sont livrés à l’adresse indiquée par le client lors
              de la commande ou selon le mode de livraison sélectionné.
            </p>
            <p className="mt-3">
              Les zones desservies, les transporteurs disponibles, les frais et
              les délais de livraison sont précisés sur le site avant la
              validation de la commande.
            </p>
            <p className="mt-3">
              MRZ Perfume s’engage à respecter le délai de livraison annoncé. À
              défaut d’indication d’une date ou d’un délai, la livraison
              intervient au plus tard dans le délai légal applicable.
            </p>
            <p className="mt-3">
              Le client doit vérifier l’exactitude de ses coordonnées et de son
              adresse avant de confirmer sa commande.
            </p>
            <p className="mt-3">
              En cas de retard, de colis perdu ou de difficulté de livraison, le
              client peut contacter MRZ Perfume afin d’obtenir des informations
              sur le suivi et les démarches possibles.
            </p>
            <p className="mt-3">
              Le transfert des risques intervient dans les conditions prévues
              par le Code de la consommation. Lorsque le vendeur propose un
              transporteur, les risques restent en principe à sa charge jusqu’à
              la prise de possession physique du bien par le client ou par un
              tiers désigné par celui-ci, autre que le transporteur proposé par
              le vendeur.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 9 – Droit de rétractation
            </h2>
            <p className="mt-3">
              Conformément aux dispositions du Code de la consommation, le
              client consommateur dispose en principe d’un délai de quatorze
              jours calendaires pour exercer son droit de rétractation lors
              d’un achat à distance.
            </p>
            <p className="mt-3">
              Pour les biens, ce délai commence à courir le lendemain de la
              réception du produit par le client ou par le tiers qu’il a
              désigné, autre que le transporteur.
            </p>
            <p className="mt-3">
              Le client n’a pas à justifier sa décision. Il doit informer MRZ
              Perfume de sa volonté de se rétracter avant l’expiration du délai,
              par une déclaration claire envoyée par e-mail ou par courrier, ou
              au moyen du formulaire type de rétractation lorsqu’il est mis à
              disposition.
            </p>
            <p className="mt-3">
              Après avoir informé le vendeur de sa décision, le client doit
              renvoyer les produits concernés dans le délai légal applicable.
            </p>
            <p className="mt-3">
              Les frais directs de retour sont à la charge du client lorsque
              celui-ci en a été informé avant la commande, sauf indication
              contraire ou disposition légale différente.
            </p>
            <p className="mt-3">
              Le remboursement intervient conformément aux délais légaux. Le
              vendeur peut différer le remboursement jusqu’à la récupération des
              biens ou jusqu’à la réception d’une preuve de leur expédition,
              selon les conditions prévues par la loi.
            </p>
            <h3 className="mt-6 font-display text-xl text-ink">
              Exception concernant les parfums descellés
            </h3>
            <p className="mt-3">
              Le droit de rétractation ne s’applique pas aux biens scellés qui
              ne peuvent être renvoyés pour des raisons d’hygiène ou de
              protection de la santé lorsqu’ils ont été descellés par le client
              après la livraison, conformément aux conditions prévues par la
              loi.
            </p>
            <p className="mt-3">
              Cette exception ne s’applique pas automatiquement à tous les
              parfums : elle dépend de la nature du produit, de son
              conditionnement et des circonstances du retour.
            </p>
            <p className="mt-3">
              Le droit de rétractation ne limite pas les droits légaux du client
              en cas de produit défectueux ou non conforme.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 10 – Retours, produits endommagés et erreurs de commande
            </h2>
            <p className="mt-3">
              Toute demande relative à un produit endommagé, manquant,
              défectueux ou différent du produit commandé peut être adressée à
              MRZ Perfume via le <ContactLink>formulaire de contact</ContactLink>.
            </p>
            <p className="mt-3">
              Le client est invité à préciser son numéro de commande et à
              joindre, si possible, des photographies permettant de comprendre
              la difficulté rencontrée.
            </p>
            <p className="mt-3">
              Cette démarche facilite le traitement de la demande sans
              constituer une condition à l’exercice des droits légaux du client.
            </p>
            <p className="mt-3">
              Les retours et remboursements sont traités conformément au droit
              applicable et aux conditions particulières de la commande.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 11 – Garanties légales
            </h2>
            <p className="mt-3">
              Les produits vendus aux consommateurs bénéficient des garanties
              légales applicables, notamment :
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                La garantie légale de conformité, prévue par les articles L.
                217-3 et suivants du Code de la consommation.
              </li>
              <li>
                La garantie des vices cachés, prévue par les articles 1641 et
                suivants du Code civil.
              </li>
            </ul>
            <p className="mt-3">
              Ces garanties s’appliquent dans les conditions et délais prévus
              par la législation.
            </p>
            <p className="mt-3">
              Le client peut contacter MRZ Perfume pour toute demande relative à
              la mise en œuvre d’une garantie légale. Les présentes conditions
              ne limitent ni n’excluent les droits impératifs dont il bénéficie.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 12 – Responsabilité
            </h2>
            <p className="mt-3">
              MRZ Perfume s’engage à exécuter ses obligations conformément à la
              législation applicable.
            </p>
            <p className="mt-3">
              Sa responsabilité ne saurait être exclue dans les cas où la loi
              interdit une telle exclusion, notamment en matière de garanties
              légales, de conformité des produits et de droits des consommateurs.
            </p>
            <p className="mt-3">
              Le client est invité à respecter les précautions d’utilisation,
              les avertissements et les consignes de conservation figurant sur
              l’emballage des produits.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 13 – Propriété intellectuelle
            </h2>
            <p className="mt-3">
              Les textes, photographies, visuels, logos, éléments graphiques et
              autres contenus présents sur le site sont protégés par les règles
              applicables en matière de propriété intellectuelle.
            </p>
            <p className="mt-3">
              Sauf autorisation préalable du titulaire des droits ou exception
              prévue par la loi, toute reproduction, représentation ou
              utilisation non autorisée de ces éléments est interdite.
            </p>
            <p className="mt-3">
              Les marques et dénominations appartenant à des tiers restent la
              propriété de leurs titulaires respectifs.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 14 – Données personnelles
            </h2>
            <p className="mt-3">
              Les données personnelles recueillies lors d’une commande sont
              utilisées pour traiter les achats, gérer les paiements, assurer la
              livraison, répondre aux demandes des clients et respecter les
              obligations légales du vendeur.
            </p>
            <p className="mt-3">
              Elles sont traitées conformément à la réglementation applicable en
              matière de protection des données personnelles.
            </p>
            <p className="mt-3">
              Les informations détaillées concernant les finalités du traitement,
              les destinataires, les durées de conservation, les droits des
              personnes et les modalités d’exercice de ces droits doivent
              figurer dans la politique de confidentialité du site.
            </p>
            <p className="mt-3">
              Pour toute question relative aux données personnelles, le client
              peut écrire à{' '}
              <a
                href="mailto:mrz.lux.perfume@gmail.com"
                className={linkClass}
              >
                mrz.lux.perfume@gmail.com
              </a>{' '}
              ou utiliser le <ContactLink>formulaire de contact</ContactLink>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 15 – Réclamations et médiation de la consommation
            </h2>
            <p className="mt-3">
              En cas de difficulté, le client est invité à contacter en premier
              lieu MRZ Parfum via le{' '}
              <ContactLink>formulaire de contact</ContactLink> afin de
              rechercher une solution amiable.
            </p>
            <p className="mt-3">
              Conformément aux dispositions applicables du Code de la
              consommation, le client consommateur peut recourir gratuitement à
              un médiateur de la consommation après avoir adressé une réclamation
              écrite préalable au vendeur et lorsque les conditions de
              recevabilité sont réunies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 16 – Force majeure
            </h2>
            <p className="mt-3">
              L’exécution des obligations de MRZ Perfume peut être affectée par
              un événement répondant à la définition légale de la force majeure.
            </p>
            <p className="mt-3">
              Les conséquences de cet événement sont appréciées conformément au
              droit applicable. Cette clause ne prive pas le client des droits
              que la loi lui reconnaît.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 17 – Droit applicable et litiges
            </h2>
            <p className="mt-3">
              Les présentes conditions générales de vente sont soumises au droit
              français, sous réserve des dispositions impératives éventuellement
              applicables au consommateur.
            </p>
            <p className="mt-3">
              En cas de différend, les parties sont invitées à rechercher une
              solution amiable. À défaut d’accord, le litige pourra être porté
              devant les juridictions compétentes conformément aux règles légales
              applicables.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              Article 18 – Modification des conditions générales de vente
            </h2>
            <p className="mt-3">
              MRZ Perfume peut mettre à jour les présentes conditions générales
              de vente afin de tenir compte de l’évolution de son activité ou de
              la réglementation.
            </p>
            <p className="mt-3">
              Les conditions applicables à une commande sont celles portées à la
              connaissance du client et acceptées au moment de cette commande,
              sous réserve des dispositions légales applicables.
            </p>
          </section>
        </div>
      </Container>
    </section>
  )
}
